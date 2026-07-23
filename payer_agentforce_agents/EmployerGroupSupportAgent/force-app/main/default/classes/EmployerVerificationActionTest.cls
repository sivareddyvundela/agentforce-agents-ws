@IsTest
private class EmployerVerificationActionTest {
    @IsTest
    static void verifiesMatchingEmployer() {
        Account employer = new Account(
            Name = 'Acme Health Benefits',
            AccountNumber = 'EMP-1001'
        );
        insert employer;

        EmployerVerificationAction.Request request =
            new EmployerVerificationAction.Request();
        request.employerName = 'Acme Health Benefits';
        request.employerAccountNumber = 'EMP-1001';

        Test.startTest();
        List<EmployerVerificationAction.Response> responses =
            EmployerVerificationAction.verifyEmployer(
                new List<EmployerVerificationAction.Request>{ request }
            );
        Test.stopTest();

        System.assertEquals(1, responses.size());
        System.assertEquals(true, responses[0].isVerified);
        System.assertEquals(employer.Id, responses[0].accountId);
        System.assertEquals('Acme Health Benefits', responses[0].employerName);
        System.assertEquals('EMP-1001', responses[0].employerAccountNumber);
    }

    @IsTest
    static void rejectsNonMatchingEmployer() {
        EmployerVerificationAction.Request request =
            new EmployerVerificationAction.Request();
        request.employerName = 'Unknown Employer';
        request.employerAccountNumber = 'NOPE';

        Test.startTest();
        List<EmployerVerificationAction.Response> responses =
            EmployerVerificationAction.verifyEmployer(
                new List<EmployerVerificationAction.Request>{ request }
            );
        Test.stopTest();

        System.assertEquals(1, responses.size());
        System.assertEquals(false, responses[0].isVerified);
        System.assertEquals(null, responses[0].accountId);
    }
}