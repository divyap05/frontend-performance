import fs from 'fs';

class Reports{
    async generateReports(flow,testName) {
        const htmlReportDir = 'reports/html/', jsonReportDir = 'reports/json/';
        if (!fs.existsSync(htmlReportDir) &&!fs.existsSync(jsonReportDir) ) {
            fs.mkdirSync(htmlReportDir);
            fs.mkdirSync(jsonReportDir);
        } 
        
        const htmlReport = await flow.generateReport();
        fs.writeFileSync('reports/html/' + testName + '_' + Date.now() + '.html', htmlReport);
        const jsonReport = await flow.createFlowResult()
        fs.writeFileSync('reports/json/' + testName + '_' + Date.now() + '.json', JSON.stringify(jsonReport, null, 2));
        return { htmlReport, jsonReport };
    }
}
export default Reports;