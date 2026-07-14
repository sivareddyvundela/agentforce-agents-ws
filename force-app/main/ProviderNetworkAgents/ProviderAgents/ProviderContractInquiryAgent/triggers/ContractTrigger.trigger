trigger ContractTrigger on Contract (after update) {
    ContractAmendmentHandler.createAmendments(
        Trigger.new,
        Trigger.oldMap
    );
}