@IsTest
private class EmployerInquiryActionTest {
    @IsTest
    static void returnsEmployerInformationForAccount() {
        Account employer = new Account(
            Name = 'Contoso Benefits',
            AccountNumber = 'EMP-2002',
            BillingCity = 'Chicago',
            BillingState = 'IL',
            BillingCountry = 'USA'
        );
        insert employer;

        EmployerInquiryAction.Request request =
            new EmployerInquiryAction.Request();
        request.accountId = employer.Id;

        Test.startTest();
        List<EmployerInquiryAction.Response> responses =
            EmployerInquiryAction.getEmployerInformation(
                new List<EmployerInquiryAction.Request>{ request }
            );
        Test.stopTest();

        System.assertEquals(1, responses.size());
        System.assertEquals(true, responses[0].success);
        System.assertNotEquals(null, responses[0].employerInquiryJson);
        System.assert(
            responses[0].inquirySummary.contains('Contoso Benefits'),
            'Summary should include the employer name.'
        );
        System.assert(
            !responses[0].employerInquiryJson.contains(employer.Id),
            'Internal Salesforce IDs should be removed from the response JSON.'
        );
    }

    @IsTest
    static void rejectsMissingAccountId() {
        EmployerInquiryAction.Request request = new EmployerInquiryAction.Request();

        Test.startTest();
        List<EmployerInquiryAction.Response> responses =
            EmployerInquiryAction.getEmployerInformation(
                new List<EmployerInquiryAction.Request>{ request }
            );
        Test.stopTest();

        System.assertEquals(1, responses.size());
        System.assertEquals(false, responses[0].success);
    }
}