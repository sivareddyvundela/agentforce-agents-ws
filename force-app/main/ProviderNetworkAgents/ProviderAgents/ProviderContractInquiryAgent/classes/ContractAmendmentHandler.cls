public class ContractAmendmentHandler {

    public static void createAmendments(
        List<Contract> newContracts,
        Map<Id, Contract> oldMap
    ) {

        List<Contract_Amendment__c> amendments =
            new List<Contract_Amendment__c>();

        for(Contract con : newContracts){

            Contract oldCon = oldMap.get(con.Id);

            trackField(
                amendments,
                con,
                oldCon,
                'Status',
                String.valueOf(oldCon.Status),
                String.valueOf(con.Status)
            );

            trackField(
                amendments,
                con,
                oldCon,
                'Start Date',
                String.valueOf(oldCon.StartDate),
                String.valueOf(con.StartDate)
            );

            trackField(
                amendments,
                con,
                oldCon,
                'End Date',
                String.valueOf(oldCon.EndDate),
                String.valueOf(con.EndDate)
            );

        }

        if(!amendments.isEmpty()){
            insert amendments;
        }
    }

    private static void trackField(
        List<Contract_Amendment__c> amendments,
        Contract con,
        Contract oldCon,
        String fieldName,
        String oldValue,
        String newValue
    ){

        if(oldValue != newValue){

            Contract_Amendment__c amendment =
                new Contract_Amendment__c();

            amendment.Contract__c = con.Id;

            amendment.Changed_Field__c =
                fieldName;

            amendment.Old_Value__c =
                oldValue;

            amendment.New_Value__c =
                newValue;

            amendment.Amendment_Summary__c =
                fieldName + ' changed from '
                + oldValue + ' to '
                + newValue;

            amendments.add(amendment);
        }
    }
}