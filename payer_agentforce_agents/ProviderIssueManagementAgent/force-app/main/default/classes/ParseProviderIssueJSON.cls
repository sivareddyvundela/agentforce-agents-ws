public class ParseProviderIssueJSON {
    public class Output {
        @InvocableVariable public String issueType;
        @InvocableVariable public Decimal confidenceScore;
        @InvocableVariable public String summary;
    }
    public class Input {
        @InvocableVariable public String jsonResponse;
    }
    @InvocableMethod(label='Parse Provider Issue JSON')
    public static List<Output> parse(List<Input> inputs) {
        List<Output> results = new List<Output>();
        for (Input inp : inputs) {
            Map<String, Object> parsed = (Map<String, Object>) JSON.deserializeUntyped(inp.jsonResponse);
            Output o = new Output();
            o.issueType = (String) parsed.get('IssueType');
            o.confidenceScore = (Decimal) parsed.get('ConfidenceScore');
            o.summary = (String) parsed.get('Summary');
            results.add(o);
        }
        return results;
    }
}