# Integration Test AWS CDK

** All scripts are located at the root directory of the project **

To deploy new changes to the Cloudformation, you have two options:

1. Use `scripts/generate-cfn.sh`
    - Generate a new Cloudformation JSON file at `cloudformation/cdk/CdkStack.template.json`
    - Go to Cloudformation UI in the correct AWS account, find the stack and update the template manually

2. Use `scripts/update-template.sh` to update the Cloudformation template from the command-line
    - This uses the `@guardian/cfn-cli` npm CLI tool to update the Cloudformation.
    - Only do this if you're confident your template changes are safe! This will still prompt you for a confirmation, 
    much like at the end of the manual method in option 1.   


## Other useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
