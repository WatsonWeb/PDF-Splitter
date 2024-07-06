/*
* Main RD Extraction Function
* Version: 2.4.1 - July 2024
* Returns: boolean (true or false)
*/
function rdExtractAndEmail() {
    // Declare global active doc object 
    var ACTIVE_DOC = this;
    if (!ACTIVE_DOC.documentFileName) {
        console.println('Error: Document object not found');
        return false;
    }

    // 1. Get formatting origin
    var FORMAT_ORIGIN = promptForFormatOrigin();
    if (!FORMAT_ORIGIN) { return false; }

    // 2. Get filename based on type of formatting
    var FILENAME = '';
    switch (FORMAT_ORIGIN) {
        case 4: // Yes (from filename)
            FILENAME = getFilenameFromSourceFile(ACTIVE_DOC);
            if (!FILENAME) { return false; }
            break;
        case 3: // No (from user input)
            FILENAME = getFilenameFromUserPrompts();
            if (!FILENAME) { return false; }
            break;
        default: // Default (Cancel or exited)
            console.println('Error: No formatting origin selected');
            return false;
    }

    // 3. Get Paths
    var PATHS = getPaths(FILENAME, ACTIVE_DOC);
    if (!PATHS) { return false; }

    // 4. Get Section 1 Last Page
    var SECTION_LASTPAGE = getSection1LastPage();
    if (!SECTION_LASTPAGE) { return false; }

    // 5. Get Outputs
    var OUTPUTS = getOutputs(FILENAME, PATHS, SECTION_LASTPAGE, ACTIVE_DOC);
    if (!OUTPUTS) { return false; }

    // 6. Extract PDFs
    var EXTRACTED_PDFS = extractPDFs(OUTPUTS, ACTIVE_DOC);
    if (!EXTRACTED_PDFS) { return false; }

    // 7. Trim existing PDF to attach to email
    var TRIMMED_PDF = trimPDFforEmail(SECTION_LASTPAGE, ACTIVE_DOC);
    if (!TRIMMED_PDF) { return false; }

    // 8. Save trimmed PDF
    var RENAMED_PDF = saveTrimmedPDF(OUTPUTS, ACTIVE_DOC);
    if (!RENAMED_PDF) { return false; }

    return true;
}

/*
* 1. Prompt user to confirm formatting
* Returns: integer (2,3,4)
*/
function promptForFormatOrigin() {
    var FORMAT_ORIGIN = app.alert(
        'Has this document been saved using a \'rdX-XX-XXXissX\' format?\nYes - The script will pull RD information from the file name.\nNo - The script will prompt for RD information.',
        2,
        3,
        'RD info from filename or prompts?'
    );

    // Error checking
    if (isNaN(FORMAT_ORIGIN)) {
        console.println('Error: promptForFormatOrigin did not return a number');
        return false;
    }

    return FORMAT_ORIGIN;
}

/*
* 2a. Get filename from source file
* Returns: string
* Params: ACTIVE_DOC (doc object)
*/
function getFilenameFromSourceFile(ACTIVE_DOC) {
    // Error checking
    if (!ACTIVE_DOC.documentFileName) {
        console.println('Error: No documentFileName in getFilenameFromSourceFile');
        return false;
    }

    // Example filename: rd84-53-5264iss1.pdf
    var filenameArray = ACTIVE_DOC.documentFileName.replace('.pdf', '').split('-');
    var seriesNum = filenameArray[0].substring(2);    // Numbers after 'rd'
    var ataChapterNum = filenameArray[1];             // Numbers between '-'
    var rdSequenceNumArray = filenameArray[2].split('iss');
    var rdSequenceNum = rdSequenceNumArray[0];        // Numbers before 'iss'
    var rdIssueNum = rdSequenceNumArray[1];           // Numbers after 'iss'

    return 'rd' + seriesNum + '-' + ataChapterNum + '-' + rdSequenceNum + 'iss' + rdIssueNum;
}

/*
* 2b. Get filename from user prompts
* Returns: string
*/
function getFilenameFromUserPrompts() {
    var FILENAME_PROMPTS = [
        {
            promptLabel: 'seriesNum',
            promptQuestion: 'Enter the aircraft Series Number:\nS100-S200-S300 = 8\nS400 = 84\nDash 2 = 2\nDash 3 = 3\nDash 4 = 4\nDash 5 = 5\nDash 6 = 6\nDash 7 = 7\nCL215/215T/415= 215\nShorts = 9',
            promptTitle: 'Aircraft Series Number',
            promptExpectedType: 'number',
            promptRequired: true,
            promptDefaultValue: ''
        },
        {
            promptLabel: 'ataChapterNum',
            promptQuestion: 'Enter the ATA Chapter:',
            promptTitle: 'Aircraft ATA Chapter',
            promptExpectedType: 'number',
            promptRequired: true,
            promptDefaultValue: ''
        },
        {
            promptLabel: 'rdSequenceNum',
            promptQuestion: 'Enter the RD Sequence Number:',
            promptTitle: 'Aircraft RD Sequence Number',
            promptExpectedType: 'number',
            promptRequired: true,
            promptDefaultValue: ''
        },
        {
            promptLabel: 'rdIssueNum',
            promptQuestion: 'Enter the RD Issue Number:',
            promptTitle: 'Aircraft RD Issue Number',
            promptExpectedType: 'number',
            promptRequired: true,
            promptDefaultValue: ''
        },
    ];

    var FILENAME_RESPONSES = askUserPrompts(FILENAME_PROMPTS);

    // Error checking
    if (!FILENAME_RESPONSES) {
        console.println('Error: askUserPrompts(FILENAME_PROMPTS) returned false');
        return false;
    }

    return 'rd' + FILENAME_RESPONSES.seriesNum + '-' + FILENAME_RESPONSES.ataChapterNum + '-' + FILENAME_RESPONSES.rdSequenceNum + 'iss' + FILENAME_RESPONSES.rdIssueNum;
}

/*
* 3. Get paths object based on filename
* Params: filename(string), ACTIVE_DOC(doc object)
* Returns: object
*/
function getPaths(filename, ACTIVE_DOC) {
    // Error checking
    if (!filename) {
        console.println('Error: No filename supplied to getPaths');
        return false;
    }

    if (!ACTIVE_DOC.documentFileName) {
        console.println('Error: Document object not found in getPaths');
        return false;
    }

    var PATHS = {
        defaultPath: '/dhcfps030/data_TechnicalServices_techserv/structur/Documents/RDs(scanned)/',
        seriesFolder: '',
        series2Folder: '2',
        series3Folder: '3',
        series4Folder: '4',
        series5Folder: '5',
        series6Folder: '6',
        series7Folder: '7',
        series8Folder: 'Q100-200-300',
        series84Folder: 'Q400',
        series215Folder: '215',
        series9Folder: 'Shorts',
        rootPath: ACTIVE_DOC.path.replace(ACTIVE_DOC.documentFileName, ''),
    };

    var filenameArray = filename.split('-');
    var seriesNum = filenameArray[0].substring(2);
    var ataChapterNum = filenameArray[1];

    switch (seriesNum) {
        case '8':
            PATHS.seriesFolder = PATHS.series8Folder;
            break;
        case '84':
            PATHS.seriesFolder = PATHS.series84Folder;
            break;
        case '2':
            PATHS.seriesFolder = PATHS.series2Folder;
            break;
        case '3':
            PATHS.seriesFolder = PATHS.series3Folder;
            break;
        case '4':
            PATHS.seriesFolder = PATHS.series4Folder;
            break;
        case '5':
            PATHS.seriesFolder = PATHS.series5Folder;
            break;
        case '6':
            PATHS.seriesFolder = PATHS.series6Folder;
            break;
        case '7':
            PATHS.seriesFolder = PATHS.series7Folder;
            break;
        case '215':
            PATHS.seriesFolder = PATHS.series215Folder;
            break;
        case '9':
            PATHS.seriesFolder = PATHS.series9Folder;
            break;
        default:
            console.println('Error: Incorrect series number entered for getPaths');
            return false;
    }

    PATHS.outputPath = PATHS.defaultPath + '/' + PATHS.seriesFolder + '/' + ataChapterNum + '/';

    return PATHS;
}

/*
* 4. Get the number of the last page of section 1
* Returns: integer
*/
function getSection1LastPage() {
    var SECTION_PROMPTS = [
        {
            promptLabel: 'sectionLastPage',
            promptQuestion: 'Enter the last page number of Section 1:',
            promptTitle: 'Section 1 - Last Page',
            promptExpectedType: 'number',
            promptRequired: true,
            promptDefaultValue: ''
        },
    ];

    var SECTION_RESPONSES = askUserPrompts(SECTION_PROMPTS);

    // Error checking
    if (!SECTION_RESPONSES) {
        console.println('Error: askUserPrompts(SECTION_PROMPTS) returned false');
        return false;
    }

    return parseInt(SECTION_RESPONSES.sectionLastPage, 10);
}

/*
* 5. Get outputs
* Params: filename(string), paths(object), sectionLastPage(integer), ACTIVE_DOC(doc object)
* Returns: array
*/
function getOutputs(filename, paths, sectionLastPage, ACTIVE_DOC) {
    // Error checking
    if (!filename) {
        console.println('Error: No filename string passed to getOutputs');
        return false;
    }

    if (!paths) {
        console.println('Error: No paths object passed to getOutputs');
        return false;
    }

    if (!sectionLastPage || isNaN(sectionLastPage)) {
        console.println('Error: No sectionLastPage integer passed to getOutputs');
        return false;
    }

    if (!ACTIVE_DOC.documentFileName) {
        console.println('Error: Document object not found in getOutputs');
        return false;
    }

    var OUTPUTS = [
        {
            start: 0,
            end: ACTIVE_DOC.numPages - 1,
            path: paths.rootPath + filename,
            suffix: 'sect1,2',
        },
        {
            start: 0,
            end: sectionLastPage - 1,
            path: paths.outputPath + filename,
            suffix: 'sect1'
        },
        {
            start: sectionLastPage,
            end: ACTIVE_DOC.numPages - 1,
            path: paths.outputPath + filename,
            suffix: 'sect2'
        },
    ];

    return OUTPUTS;
}

/*
* 6. Extract PDFs
* Params: outputs(array), ACTIVE_DOC(doc object)
* Returns: boolean (true or false)
*/
function extractPDFs(outputs, ACTIVE_DOC) {
    // Error checking
    if (typeof outputs !== 'object' || !outputs.length) {
        console.println('Error: No outputs array passed to extractPDFs');
        return false;
    }

    if (!ACTIVE_DOC.documentFileName) {
        console.println('Error: Document object not found in extractPDFs');
        return false;
    }

    for (var j = 0; j < outputs.length; j++) {
        try {
            ACTIVE_DOC.extractPages({ nStart: outputs[j].start, nEnd: outputs[j].end, cPath: outputs[j].path + outputs[j].suffix + '.pdf' });
        } catch (e) {
            console.println(e);
        }
    }

    return true;
}

/*
* 7. Trims existing PDF to attach to email
* Params: sectionLastPage(integer), ACTIVE_DOC(doc object)
* Returns: boolean (true or false)
*/
function trimPDFforEmail(sectionLastPage, ACTIVE_DOC) {
    // Error checking
    if (!sectionLastPage || isNaN(sectionLastPage)) {
        console.println('Error: No sectionLastPage integer passed to getOutputs');
        return false;
    }

    if (!ACTIVE_DOC.documentFileName) {
        console.println('Error: Document object not found in trimPDFforEmail');
        return false;
    }

    ACTIVE_DOC.deletePages({ nStart: sectionLastPage, nEnd: ACTIVE_DOC.numPages - 1 });

    return true;
}

/*
* 8. Saves trimmed PDF with new filename before attaching to email
* Params: outputs(array), ACTIVE_DOC(doc object)
* Returns: boolean (true or false)
*/
function saveTrimmedPDF(outputs, ACTIVE_DOC) {
    // Error checking
    if (typeof outputs !== 'object' || !outputs.length) {
        console.println('Error: No outputs array passed to saveTrimmedPDF');
        return false;
    }

    if (!ACTIVE_DOC.documentFileName) {
        console.println('Error: Document object not found in saveTrimmedPDF');
        return false;
    }

    ACTIVE_DOC.saveAs({
        cPath: outputs[0].path + '.pdf'
    });

    return true;
}

/*
* Prompt user with supplied prompts
* Params: prompts(array)
* Returns: object
*/
function askUserPrompts(prompts) {
    // Error checking
    if (!prompts.length) {
        console.println('Error: No prompts array passed to askUserPrompts');
        return false;
    }

    var RESPONSES = {};

    for (var i = 0; i < prompts.length; i++) {
        try {
            var promptResponse = app.response(prompts[i].promptQuestion, prompts[i].promptTitle, prompts[i].promptDefaultValue);

            // Error checking
            if (prompts[i].promptRequired && !promptResponse.length) {
                throw 'No answer entered for question:' + prompts[i].promptQuestion;
            }

            if (prompts[i].promptExpectedType === 'number' && isNaN(promptResponse)) {
                throw 'Number not entered for question:' + prompts[i].promptQuestion;
            }

            RESPONSES[prompts[i].promptLabel] = promptResponse;
        } catch (e) {
            console.println('Error: ' + e);
            return false;
        }
    }

    return RESPONSES;
}

/*
* Add button to toolbar
*/
app.addToolButton({
    cName: 'RD Extract-Save',
    cLabel: 'RD Extract-Save',
    cExec: 'rdExtractAndEmail()',
    cTooltext: 'Extract and Save Sect 1 & 2',
    cEnable: true,
    nPos: -1
});
