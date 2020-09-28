import * as cdk from '@aws-cdk/core';
import { Duration, Fn, Stack, Tags } from '@aws-cdk/core';
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
import {
  Alarm,
  ComparisonOperator,
  Metric,
  TreatMissingData,
} from '@aws-cdk/aws-cloudwatch';
import { SubscriptionProtocol, Topic } from '@aws-cdk/aws-sns';
import { SnsAction } from '@aws-cdk/aws-cloudwatch-actions';
import { UrlSubscription } from '@aws-cdk/aws-sns-subscriptions';

const SUITES = ['Grid', 'Composer', 'Workflow'];
const APP_NAME = 'editorial-tools-integration-tests';
const DIST_BUCKET = `${APP_NAME}-dist`;
const CRON_FREQUENCY = 3; // number in minutes

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
      alertWebhook: new cdk.CfnParameter(this, 'AlertWebhook', {
        type: 'String',
        description: 'The webhook for the SNS alert topic to send to Pagerduty',
      }),
    };

    const stage = params.stage.valueAsString;

    Tags.of(this).add('Stage', stage);
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
          resources: [`arn:aws:s3::*:${APP_NAME}/*`],
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

    const pagerdutyTopic = new Topic(this, 'pagerduty-sns', {
      displayName: `pagerduty-integration-tests-${stage.toUpperCase()}`,
    });

    pagerdutyTopic.addSubscription(
      new UrlSubscription(params.alertWebhook.valueAsString, {
        protocol: SubscriptionProtocol.HTTPS,
      })
    );

    const snsAction = new SnsAction(pagerdutyTopic);

    SUITES.map((suite) => {
      const enrichedAppName = `${APP_NAME}-${suite.toLowerCase()}`;
      const launchConfigName = `LaunchConfig${suite}`;
      const userData = Fn.base64(`#!/bin/bash -ev

cfn-init -s ${stack.stackId} -r ${launchConfigName} --region ${stack.region} || error_exit ''Failed to run cfn-init''

attach-ebs-volume -d k -m /data

# Set up the tests and their dependencies
aws s3 cp s3://${DIST_BUCKET}/media-service/${stage}/${enrichedAppName}/${enrichedAppName}.zip /tmp/${enrichedAppName}.zip
unzip -q /tmp/${enrichedAppName}.zip -d /data/${enrichedAppName}

# Install Cypress dependencies
npm install --global yarn
/data/${enrichedAppName}/node_modules/cypress/bin/cypress install


# get envars
aws s3 cp s3://${DIST_BUCKET}/env.json /data/${enrichedAppName}/env.json

# Set up logstash
systemctl start logstash
`);
      const launchConfiguration = new CfnLaunchConfiguration(
        this,
        launchConfigName,
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
*/${CRON_FREQUENCY} * * * * root /data/${enrichedAppName}/scripts/run.sh ${stage} ${suite.toLowerCase()} >> /var/log/tests.log 2>&1
`,
            },
            '/etc/logstash/conf.d/logstash.conf': {
              content: `
      input {
        file {
          path => "/data/${enrichedAppName}/logs/tests.json.log"
          type => "application"
          codec => json
        }
      }
      filter {
        mutate {
          add_field => {
            "app" => "${APP_NAME}"
            "stack" => "media-service"
            "stage" => "${stage}"
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
            value: stage,
          },
          {
            key: 'Stack',
            propagateAtLaunch: true,
            value: params.stack.valueAsString,
          },
          {
            key: 'App',
            propagateAtLaunch: true,
            value: enrichedAppName,
          },
        ],
      });
      asg.addDependsOn(launchConfiguration);

      const metric = new Metric({
        namespace: APP_NAME,
        metricName: 'Test Result',
        dimensions: {
          suite: suite.toLowerCase(),
          stage: 'PROD',
        },
        period: Duration.minutes(CRON_FREQUENCY),
        statistic: 'Maximum',
      });

      const alarm = new Alarm(this, `failures-alarm-${suite.toLowerCase()}`, {
        alarmDescription: `More than 3 integration test failures out of 10 for ${suite}. Check logs for more information`,
        datapointsToAlarm: 3,
        evaluationPeriods: 10,
        comparisonOperator:
          ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        metric: metric,
        threshold: 1,
        actionsEnabled: true,
        treatMissingData: TreatMissingData.MISSING,
      });
      alarm.addAlarmAction(snsAction);
      alarm.addOkAction(snsAction);
      alarm.addInsufficientDataAction(snsAction);
    });
  }
}
