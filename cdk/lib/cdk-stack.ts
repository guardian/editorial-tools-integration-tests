import * as cdk from '@aws-cdk/core';
import { Fn, Stack, Tags, Duration } from '@aws-cdk/core';
import {
  CfnInstanceProfile,
  Effect,
  Policy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from '@aws-cdk/aws-iam';
import {
  CfnAutoScalingGroup,
  CfnLaunchConfiguration,
} from '@aws-cdk/aws-autoscaling';
import { CfnSecurityGroup } from '@aws-cdk/aws-ec2';
import { Alarm, Metric } from '@aws-cdk/aws-cloudwatch';

const SUITES = ['Grid', 'Composer', 'Workflow'];
const DIST_BUCKET = 'editorial-tools-integration-tests-dist';

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const stack = Stack.of(this);
    const params = {
      stack: new cdk.CfnParameter(this, 'Stack', {
        type: 'String',
        description: 'Stack',
        default: 'media-service',
      }),
      stage: new cdk.CfnParameter(this, 'Stage', {
        type: 'String',
        description: 'Stage',
        allowedValues: ['CODE', 'PROD'],
      }),
      ami: new cdk.CfnParameter(this, 'AMI', {
        type: 'String',
        description: 'AMI ID',
      }),
      instanceType: new cdk.CfnParameter(this, 'InstanceType', {
        type: 'String',
        description: 'EC2 instance type',
        default: 't3.small',
      }),
      vpcId: new cdk.CfnParameter(this, 'VpcId', {
        description:
          'ID of the VPC onto which to launch the application eg. vpc-1234abcd',
        type: 'AWS::EC2::VPC::Id',
      }),
      privateVpcSubnets: new cdk.CfnParameter(this, 'PrivateVpcSubnets', {
        description:
          'Subnets to use in VPC for private EC2 instances eg. subnet-abcd1234',
        type: 'String', // TODO: Replace with 'List<AWS::EC2::Subnet::Id>'
      }),
      kinesisStreamName: new cdk.CfnParameter(this, 'KinesisStreamName', {
        type: 'String',
        description:
          'The name (NOT arn) of the Kinesis stream that logs should be shipped to',
      }),
    };

    Tags.of(this).add('Stage', params.stage.valueAsString);
    Tags.of(this).add('Stack', params.stack.valueAsString);

    const loggingRoleParam = new cdk.CfnParameter(
      this,
      'LoggingRoleToAssumeArn',
      {
        type: 'String',
        description:
          'Name of IAM role in logging account e.g. arn:aws:iam::222222222222:role/LoggingRole',
      }
    );

    const loggingStreamParam = new cdk.CfnParameter(this, 'LoggingStreamName', {
      type: 'String',
      description: 'Name of Kinesis Logging stream',
    });

    const policyStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['sts:AssumeRole'],
      resources: [loggingRoleParam.valueAsString],
    });

    const servicePrincipal = new ServicePrincipal('ec2.amazonaws.com');

    const edToolsIntegrationTestsRole = new Role(
      this,
      'EditorialToolsIntegrationTestRole',
      { path: '/', assumedBy: servicePrincipal }
    );

    new Policy(this, 'LoggingPolicy', {
      policyName: 'LoggingPolicy',
      statements: [policyStatement],
      roles: [edToolsIntegrationTestsRole],
    });

    const serverInstanceProfile = new CfnInstanceProfile(
      this,
      'ServerInstanceProfile',
      {
        path: '/',
        roles: [edToolsIntegrationTestsRole.roleName],
      }
    );

    new Policy(this, 'UserDataPolicy', {
      policyName: 'download-artifacts-from-s3',
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['s3:GetObject'],
          resources: [
            `arn:aws:s3::*:${DIST_BUCKET}/*`,
            'arn:aws:s3::*:pan-domain-auth-settings/*',
          ],
        }),
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['s3:putObject'],
          resources: ['arn:aws:s3::*:editorial-tools-integration-tests/*'],
        }),
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['cloudwatch:PutMetricData', 'ec2:DescribeTags'],
          resources: ['*'],
        }),
      ],
      roles: [edToolsIntegrationTestsRole],
    });

    new Policy(this, 'SSMCommandPolicy', {
      policyName: 'ssm-run-command-policy',
      roles: [edToolsIntegrationTestsRole],
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            'ec2messages:AcknowledgeMessage',
            'ec2messages:DeleteMessage',
            'ec2messages:FailMessage',
            'ec2messages:GetEndpoint',
            'ec2messages:GetMessages',
            'ec2messages:SendReply',
            'ssm:UpdateInstanceInformation',
            'ssm:ListInstanceAssociations',
            'ssm:DescribeInstanceProperties',
            'ssm:DescribeDocumentParameters',
            'ssmmessages:CreateControlChannel',
            'ssmmessages:CreateDataChannel',
            'ssmmessages:OpenControlChannel',
            'ssmmessages:OpenDataChannel',
          ],
          resources: ['*'],
        }),
      ],
    });

    new Policy(this, 'LogShippingPolicy', {
      policyName: 'log-shipping-policy',
      roles: [edToolsIntegrationTestsRole],
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['kinesis:Describe*', 'kinesis:Put*'],
          resources: [
            `arn:aws:kinesis:${stack.region}:${stack.account}:stream/${params.kinesisStreamName.valueAsString}`,
          ],
        }),
      ],
    });

    const applicationSecurityGroup = new CfnSecurityGroup(
      this,
      'ApplicationSecurityGroup',
      { groupDescription: 'HTTP', vpcId: params.vpcId.valueAsString }
    );

    SUITES.map((suite) => {
      const appName = `editorial-tools-integration-tests-${suite.toLowerCase()}`;
      const userData = Fn.base64(`#!/bin/bash -ev

cfn-init -s ${stack.stackId} -r LaunchConfig${suite} --region ${stack.region} || error_exit ''Failed to run cfn-init''

attach-ebs-volume -d k -m /data


# Set up the tests and their dependencies
aws s3 cp s3://${DIST_BUCKET}/media-service/${params.stage.valueAsString}/${appName}/${appName}.zip /tmp/${appName}.zip
unzip -q /tmp/${appName}.zip -d /data/${appName}

# Install Cypress dependencies
apt install -y npm
npm install --global yarn
apt-get -y install libgtk2.0-0 libgtk-3-0 libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb
/data/${appName}/node_modules/cypress/bin/cypress install


# get envars
aws s3 cp s3://${DIST_BUCKET}/env.json /data/${appName}/env.json

# Set up logstash
systemctl start logstash
`);
      const launchConfiguration = new CfnLaunchConfiguration(
        this,
        `LaunchConfig${suite}`,
        {
          blockDeviceMappings: [
            {
              deviceName: '/dev/sdk',
              ebs: { volumeSize: 150, volumeType: 'gp2' },
            },
          ],
          imageId: params.ami.valueAsString,
          associatePublicIpAddress: true,
          securityGroups: [applicationSecurityGroup.ref],
          instanceType: params.instanceType.valueAsString,
          iamInstanceProfile: serverInstanceProfile.ref,
          userData: userData,
        }
      );

      launchConfiguration.addOverride('Metadata.AWS::CloudFormation::Init', {
        config: {
          files: {
            '/etc/cron.d/run-integration-tests': {
              content: `
*/4 * * * * root /data/${appName}/scripts/run.sh ${
                params.stage.valueAsString
              } ${suite.toLowerCase()} >> /var/log/tests.log 2>&1
`,
            },
            '/etc/logstash/conf.d/logstash.conf': {
              content: `
      input {
        file {
          path => "/data/${appName}/logs/tests.json.log"
          type => "application"
          codec => json
        }
      }
      filter {
        mutate {
          add_field => {
            "app" => "${appName}"
            "stack" => "media-service"
            "stage" => "${params.stage.valueAsString}"
          }
        }
      }
      output {
        kinesis {
          role_arn => "${loggingRoleParam.valueAsString}"
          stream_name => "${loggingStreamParam.valueAsString}"
          randomized_partition_key => true
          region => "${stack.region}"
        }
      }
`,
              mode: '000644',
            },
          },
        },
      });

      const asg = new CfnAutoScalingGroup(this, `AutoscalingGroup${suite}`, {
        maxSize: '2',
        minSize: '1',
        vpcZoneIdentifier: [params.privateVpcSubnets.valueAsString],
        launchConfigurationName: launchConfiguration.ref,
        tags: [
          {
            key: 'Stage',
            propagateAtLaunch: true,
            value: params.stage.valueAsString,
          },
          {
            key: 'Stack',
            propagateAtLaunch: true,
            value: params.stack.valueAsString,
          },
          {
            key: 'App',
            propagateAtLaunch: true,
            value: appName,
          },
        ],
      });
      asg.addDependsOn(launchConfiguration);

      const metric = new Metric({
        namespace: 'editorial-tools-integration-tests',
        metricName: 'Test Result',
        dimensions: {
          suite: suite.toLowerCase(),
          stage: 'PROD',
        },
        period: Duration.minutes(4),
      });

      new Alarm(this, `failures-alarm-${suite.toLowerCase()}`, {
        alarmDescription: `More than 3 failures out of 10 for ${suite}`,
        datapointsToAlarm: 3,
        evaluationPeriods: 10,
        metric: metric,
        threshold: 1,
      });
    });
  }
}
