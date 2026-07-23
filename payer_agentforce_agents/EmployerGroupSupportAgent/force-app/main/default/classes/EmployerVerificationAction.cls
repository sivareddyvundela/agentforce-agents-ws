public with sharing class EmployerVerificationAction {
    @InvocableMethod(
        label='Employer Verification Action'
        description='Verifies an employer using Employer Account Name and Employer Account Number.'
    )
    public static List<Response> verifyEmployer(List<Request> requests) {
        List<Response> responses = new List<Response>();

        for (Request request : requests) {
            Response response = new Response();

            if (
                String.isBlank(request.employerName) ||
                String.isBlank(request.employerAccountNumber)
            ) {
                response.isVerified = false;
                response.message = 'Employer Account Name and Employer Account Number are required.';
                responses.add(response);
                continue;
            }

            List<Account> accounts = [
                SELECT Id, Name, AccountNumber
                FROM Account
                WHERE Name = :request.employerName
                    AND AccountNumber = :request.employerAccountNumber
                LIMIT 1
            ];

            if (accounts.isEmpty()) {
                response.isVerified = false;
                response.message = 'Employer verification failed.';
            } else {
                Account employer = accounts[0];
                response.isVerified = true;
                response.accountId = employer.Id;
                response.employerName = employer.Name;
                response.employerAccountNumber = employer.AccountNumber;
                response.message = 'Employer verified successfully.';
            }

            responses.add(response);
        }

        return responses;
    }

    public class Request {
        @InvocableVariable(
            required=true
            label='Employer Name'
            description='Employer Account Name provided by the user.'
        )
        public String employerName;

        @InvocableVariable(
            required=true
            label='Employer Account Number'
            description='Employer Account Number provided by the user.'
        )
        public String employerAccountNumber;
    }

    public class Response {
        @InvocableVariable(label='Account Id')
        public String accountId;

        @InvocableVariable(label='Employer Name')
        public String employerName;

        @InvocableVariable(label='Employer Account Number')
        public String employerAccountNumber;

        @InvocableVariable(label='Is Verified')
        public Boolean isVerified;

        @InvocableVariable(label='Message')
        public String message;
    }
}