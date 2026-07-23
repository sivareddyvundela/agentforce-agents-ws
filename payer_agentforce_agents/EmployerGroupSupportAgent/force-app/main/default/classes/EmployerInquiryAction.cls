public without sharing class EmployerInquiryAction {
    @InvocableMethod(
        label='Employer Inquiry Action'
        description='Retrieves employer account, policy, participant, coverage, and case information by verified Account Id.'
    )
    public static List<Response> getEmployerInformation(List<Request> requests) {
        List<Response> responses = new List<Response>();

        for (Request request : requests) {
            Response response = new Response();

            if (String.isBlank(request.accountId)) {
                response.success = false;
                response.message = 'Account Id is required.';
                responses.add(response);
                continue;
            }

            List<Account> accounts = [
                SELECT Id, Name, AccountNumber, BillingStreet, BillingCity,
                    BillingState, BillingCountry, OwnerId
                FROM Account
                WHERE Id = :request.accountId
                LIMIT 1
            ];

            if (accounts.isEmpty()) {
                response.success = false;
                response.message = 'No employer account was found for the provided Account Id.';
                responses.add(response);
                continue;
            }

            Map<String, Object> result = new Map<String, Object>();
            List<String> retrievalWarnings = new List<String>();
            Account employer = accounts[0];
            result.put('account', sanitizeRecord(employer));

            List<SObject> policies = queryOptionalRecords(
                'InsurancePolicy',
                'SELECT Id, Name, PolicyName, Status, EffectiveFromDate, EffectiveToDate, ' +
                    'PolicyType, PremiumAmount, PremiumFrequency, NameInsuredId, ' +
                    'BillingCarrierAccountId, RenewalDate, CurrencyIsoCode, PolicyDescription ' +
                    'FROM InsurancePolicy WHERE NameInsuredId = :accountId',
                new Map<String, Object>{ 'accountId' => request.accountId },
                retrievalWarnings
            );
            result.put('insurancePolicies', sanitizeRecords(policies));

            List<Id> policyIds = collectIds(policies);
            List<SObject> participants = new List<SObject>();
            List<SObject> coverages = new List<SObject>();

            if (!policyIds.isEmpty()) {
                participants = queryOptionalRecords(
                    'InsurancePolicyParticipant',
                    'SELECT Id, Name, ParticipantName, PrimaryParticipantContactId, ' +
                        'InsurancePolicyId, Role, IsActiveParticipant, EffectiveFromDate, ' +
                        'EffectiveToDate, RelationshipToInsured ' +
                        'FROM InsurancePolicyParticipant WHERE InsurancePolicyId IN :policyIds',
                    new Map<String, Object>{ 'policyIds' => policyIds },
                    retrievalWarnings
                );
                coverages = queryOptionalRecords(
                    'InsurancePolicyCoverage',
                    'SELECT Id, CoverageName, Category, EffectiveFromDate, EffectiveToDate, ' +
                        'DeductibleAmount, InsurancePolicyId ' +
                        'FROM InsurancePolicyCoverage WHERE InsurancePolicyId IN :policyIds',
                    new Map<String, Object>{ 'policyIds' => policyIds },
                    retrievalWarnings
                );
            }

            result.put('insurancePolicyParticipants', sanitizeRecords(participants));
            result.put('insurancePolicyCoverages', sanitizeRecords(coverages));

            List<SObject> contacts = queryOptionalRecords(
                'Contact',
                'SELECT Id, Name, Email, Phone, Title, AccountId ' +
                    'FROM Contact WHERE AccountId = :accountId ORDER BY Name ASC',
                new Map<String, Object>{ 'accountId' => request.accountId },
                retrievalWarnings
            );
            result.put('contacts', sanitizeRecords(contacts));

            List<SObject> cases = queryOptionalRecords(
                'Case',
                'SELECT Id, CaseNumber, Subject, Status, Priority, Type, Description, AccountId ' +
                    'FROM Case WHERE AccountId = :accountId ORDER BY CreatedDate DESC',
                new Map<String, Object>{ 'accountId' => request.accountId },
                retrievalWarnings
            );
            result.put('cases', sanitizeRecords(cases));
            result.put('retrievalWarnings', retrievalWarnings);

            response.success = true;
            response.message = retrievalWarnings.isEmpty()
                ? 'Employer information retrieved successfully.'
                : 'Employer information retrieved with warnings: ' +
                    String.join(retrievalWarnings, '; ');
            response.employerInquiryJson = JSON.serialize(result);
            response.inquirySummary = buildSummary(
                employer,
                policies.size(),
                participants.size(),
                coverages.size(),
                contacts.size(),
                cases.size()
            );
            responses.add(response);
        }

        return responses;
    }

    private static List<SObject> queryOptionalRecords(
        String queryName,
        String soql,
        Map<String, Object> binds,
        List<String> retrievalWarnings
    ) {
        try {
            return Database.queryWithBinds(soql, binds, AccessLevel.SYSTEM_MODE);
        } catch (Exception e) {
            String warning =
                queryName +
                ' query failed: ' +
                e.getTypeName() +
                ' - ' +
                e.getMessage();
            System.debug(LoggingLevel.WARN, warning);
            retrievalWarnings.add(warning);
            return new List<SObject>();
        }
    }

    private static List<Id> collectIds(List<SObject> records) {
        List<Id> ids = new List<Id>();
        for (SObject record : records) {
            ids.add((Id) record.get('Id'));
        }
        return ids;
    }

    private static List<Map<String, Object>> sanitizeRecords(List<SObject> records) {
        List<Map<String, Object>> sanitized = new List<Map<String, Object>>();
        for (SObject record : records) {
            sanitized.add(sanitizeRecord(record));
        }
        return sanitized;
    }

    private static Map<String, Object> sanitizeRecord(SObject record) {
        Map<String, Object> fields = new Map<String, Object>();
        Map<String, Object> populatedFields = record.getPopulatedFieldsAsMap();

        for (String fieldName : populatedFields.keySet()) {
            if (!fieldName.endsWith('Id')) {
                fields.put(fieldName, populatedFields.get(fieldName));
            }
        }

        return fields;
    }

    private static String buildSummary(
        Account employer,
        Integer policyCount,
        Integer participantCount,
        Integer coverageCount,
        Integer contactCount,
        Integer caseCount
    ) {
        return 'Retrieved employer information for ' +
            employer.Name +
            ': ' +
            policyCount +
            ' policies, ' +
            participantCount +
            ' participants, ' +
            coverageCount +
            ' coverages, ' +
            contactCount +
            ' contacts, and ' +
            caseCount +
            ' cases.';
    }

    public class Request {
        @InvocableVariable(
            required=true
            label='Account Id'
            description='Verified employer Account Id returned by Employer Verification Action.'
        )
        public String accountId;
    }

    public class Response {
        @InvocableVariable(label='Employer Inquiry JSON')
        public String employerInquiryJson;

        @InvocableVariable(label='Inquiry Summary')
        public String inquirySummary;

        @InvocableVariable(label='Message')
        public String message;

        @InvocableVariable(label='Success')
        public Boolean success;
    }
}