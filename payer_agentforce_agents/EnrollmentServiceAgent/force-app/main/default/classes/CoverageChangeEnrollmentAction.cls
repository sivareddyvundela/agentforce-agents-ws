public with sharing class CoverageChangeEnrollmentAction {
    /**
     * Captures a coverage change enrollment request for an account and dependent.
     */
    @InvocableMethod(
        label='Coverage Change Enrollment Action'
        description='Captures a coverage change enrollment request for an account and dependent.'
    )
    public static List<Response> enrollCoverageChange(List<Request> requests) {
        System.debug('Inside enrollCoverageChange, requests: '+requests);
        List<Response> responses = new List<Response>();
        if (requests == null || requests.isEmpty()) {
            return responses;
        }

        Set<String> accountNames = new Set<String>();
        for (Request request : requests) {
            if (request != null && String.isNotBlank(request.accountName)) {
                accountNames.add(request.accountName);
            }
        }
        system.debug('accountNames: '+accountNames);

        Map<String, Account> accountsByName = new Map<String, Account>();
        if (!accountNames.isEmpty()) {
            for (Account accountRecord : [
                SELECT Id, Name
                FROM Account
                WHERE Name IN :accountNames
            ]) {
                accountsByName.put(accountRecord.Name, accountRecord);
            }
        }
        system.debug('accountsByName: '+accountsByName);

        List<Case> casesToInsert = new List<Case>();
        List<Integer> responseIndexes = new List<Integer>();
        for (Integer i = 0; i < requests.size(); i++) {
            Request request = requests[i];
            Response response = new Response();
            responses.add(response);

            if (request == null) {
                response.message = 'Request data is required.';
                continue;
            }

            if (
                String.isBlank(request.accountName) ||
                String.isBlank(request.coverageChangeType) ||
                String.isBlank(request.dependentName) ||
                String.isBlank(request.dependentGender) ||
                //request.dependentDob == null ||
                String.isBlank(request.relationToSubscriber) //||
                //request.effectiveDateOfChange == null
            ) {
                response.message = 'Account Name, Coverage Change Type, Dependent Name, Dependent Gender, and Relation To Subscriber are required.';
                continue;
            }

            Account matchedAccount = accountsByName.get(request.accountName);
            if (matchedAccount == null) {
                response.message = 'Account not found for the provided Account Name.';
                continue;
            }

            response.accountId = matchedAccount.Id;
            response.accountName = matchedAccount.Name;
            response.coverageChangeType = request.coverageChangeType;

            Case newCase = buildCase(request, matchedAccount);
            casesToInsert.add(newCase);
            responseIndexes.add(i);
        }

        if (!casesToInsert.isEmpty() && Schema.sObjectType.Case.isCreateable()) {
            insert casesToInsert;

            for (Integer j = 0; j < casesToInsert.size(); j++) {
                Case createdCase = casesToInsert[j];
                system.debug('createdCase: '+createdCase);
                if (createdCase == null || createdCase.Id == null) {
                    continue;
                }
				
                Integer responseIndex = responseIndexes[j];
                Response response = responses[responseIndex];

                response.accountId = createdCase.AccountId;
                response.accountName = response.accountName != null ? response.accountName : null;
                response.coverageChangeType = createdCase.Coverage_Change_Type__c;
                response.caseNumber = createdCase.CaseNumber;
                response.issueId = createdCase.Issue_Id__c;
                response.message = 'Coverage change enrollment request captured successfully.';
            }
        }

        system.debug('responses: '+responses);
        return responses;
    }

    private static Case buildCase(Request request, Account matchedAccount) {
        Case newCase = new Case();
        newCase.Subject = 'Coverage Change Request - ' + request.coverageChangeType;
        newCase.Priority = 'Medium';
        newCase.Origin = 'Web';
        newCase.Status = 'New';
        newCase.AccountId = matchedAccount.Id;
        newCase.Dependent_Name__c = request.dependentName;
        newCase.Dependent_DOB__c = request.dependentDob;
        newCase.Dependent_Gender__c = request.dependentGender;
        newCase.Relation_To_Subscriber__c = request.relationToSubscriber;
        newCase.Effective_Date_of_Change__c = request.effectiveDateOfChange;
        newCase.Coverage_Change_Type__c = request.coverageChangeType;
        newCase.Issue_Id__c = generateRandomNumber();
        newCase.Description = buildDescription(request, matchedAccount);
        return newCase;
    }

    private static String buildDescription(Request request, Account matchedAccount) {
        return 'Coverage change request for account ' + matchedAccount.Name +
            '. Dependent: ' + request.dependentName +
            '. Coverage change type: ' + request.coverageChangeType +
            '. Relation to subscriber: ' + request.relationToSubscriber;
    }

    private static String generateRandomNumber() {
        Integer randomNum = Math.floor(Math.random() * 90000).intValue() + 10000;
        return String.valueOf(randomNum);
    }

    /**
     * Request wrapper for coverage change enrollment.
     */
    public class Request {
        @InvocableVariable(
            required=true
            label='Account Name'
            description='Account name for the policyholder or employer.'
        )
        public String accountName;

        @InvocableVariable(
            required=true
            label='Coverage Change Type'
            description='Type of coverage change requested. Options include Add Dependent and Remove Dependent.'
        )
        public String coverageChangeType;

        @InvocableVariable(
            required=true
            label='Dependent Name'
            description='Name of the dependent being added or removed.'
        )
        public String dependentName;

        @InvocableVariable(
            required=true
            label='Dependent Gender'
            description='Gender of the dependent.'
        )
        public String dependentGender;

        @InvocableVariable(
            label='Dependent DOB'
            description='Date of birth of the dependent.'
        )
        public Date dependentDob;

        @InvocableVariable(
            required=true
            label='Relation To Subscriber'
            description='Relationship of the dependent to the subscriber.'
        )
        public String relationToSubscriber;

        @InvocableVariable(
            label='Effective Date Of Change'
            description='Effective date for the coverage change.'
        )
        public Date effectiveDateOfChange;
    }

    /**
     * Response wrapper for coverage change enrollment.
     */
    public class Response {
        @InvocableVariable(label='Account Id')
        public String accountId;

        @InvocableVariable(label='Account Name')
        public String accountName;

        @InvocableVariable(label='Coverage Change Type')
        public String coverageChangeType;

        /*@InvocableVariable(label='Dependent Name')
        public String dependentName;

        @InvocableVariable(label='Dependent Gender')
        public String dependentGender;

        @InvocableVariable(label='Dependent DOB')
        public Date dependentDob;

        @InvocableVariable(label='Relation To Subscriber')
        public String relationToSubscriber;

        @InvocableVariable(label='Effective Date Of Change')
        public Date effectiveDateOfChange;

        @InvocableVariable(label='Is Enrolled')
        public Boolean isEnrolled;*/

        @InvocableVariable(label='Case Number')
        public String caseNumber;

        @InvocableVariable(label='Issue Id')
        public String issueId;

        @InvocableVariable(label='Message')
        public String message;
    }
}