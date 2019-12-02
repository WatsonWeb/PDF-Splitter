/*
* Main RD Extract and Email Function
*/
function rdExtractAndEmail(){
	// 1. Get formatting style
	var FORMAT_ORIGIN = promptForFormatOrigin();
	var FILENAME = '';

	// 2. Get filename based on type of formatting
	switch (FORMAT_ORIGIN) {
	
	case 4: // Yes (from filename)
		FILENAME = getFilenameFromSourceFile();
		break;
	
	case 3: // No (from user input)
		FILENAME = getFilenameFromUserPrompts();
		break;
	
	default: // Default (Cancel or exited)
		console.println('Error: No formatting style selected');
		return false;
	}

	// 3. Get Paths
	var PATHS = getPaths(FILENAME);

	// 4. Get Section 1 Last Page
	var SECTION_LASTPAGE = getSection1LastPage();

	// 5. Get Outputs
	var OUTPUTS = getOutputs(FILENAME, PATHS, SECTION_LASTPAGE);

	// 6. Extract PDFS
	extractPDFs(OUTPUTS);

	// 7. Draft an e-mail
	createDraftEmail(OUTPUTS[0].path);
}

/*
* 1. Prompt user to confirm formatting
* Returns: integer (2,3,4)
*/
function promptForFormatOrigin() {
	return app.alert(
		'Has this document been saved using a \'rdX-XX-XXXissXSect1,2,bill\' format?\nYes - The script will pull RD information from the file name.\nNo - The script will prompt for RD information.',
		2,
		3,
		'RD info from filename or prompts?'
	);
}

/*
* 2a. Get filename from source file
* Returns: string
*/
function getFilenameFromSourceFile(){
	// Example filename: rd84-53-5264iss31Sect1,2,bill.pdf
	var filenameArray		= documentFileName.split('-');
	var seriesNum			= filenameArray[0].substring(2);	// Numbers after 'rd'
	var ataChapterNum		= filenameArray[1];					// Numbers between '-'
	var rdSequenceNumArray 	= filenameArray[2].split('iss');
	var rdSequenceNum		= rdSequenceNumArray[0];			// Numbers before 'iss'
	var rdIssueNumArray		= rdSequenceNumArray[1].split('Sect');
	var rdIssueNum			= rdIssueNumArray[0];				// Numbers after 'iss'

	return 'rd' + seriesNum + '-' + ataChapterNum + '-' + rdSequenceNum + 'iss' + rdIssueNum;
}

/*
* 2b. Get filename from user prompts
* Returns: string
*/
function getFilenameFromUserPrompts() {
	var FILENAME_PROMPTS = [
		{
			promptLabel:		'seriesNum',
			promptQuestion:		'Enter the aircraft Series Number:\nS100-S200-S300 = 8\nS400 = 84',
			promptTitle:		'Aircraft Series Number',
			promptDefaultValue:	''
		},
		{
			promptLabel:		'ataChapterNum',
			promptQuestion:		'Enter the ATA Chapter:',
			promptTitle:		'Aircraft ATA Chapter',
			promptDefaultValue:	''
		},
		{
			promptLabel:		'rdSequenceNum',
			promptQuestion:		'Enter the RD Sequence Number:',
			promptTitle:		'Aircraft RD Sequence Number',
			promptDefaultValue:	''
		},
		{
			promptLabel:		'rdIssueNum',
			promptQuestion:		'Enter the RD Issue Number:',
			promptTitle:		'Aircraft RD Issue Number',
			promptDefaultValue:	''
		},
	];

	var FILENAME_RESPONSES = askUserPrompts(FILENAME_PROMPTS);

	return 'rd' + FILENAME_RESPONSES.seriesNum + '-' + FILENAME_RESPONSES.ataChapterNum + '-' + FILENAME_RESPONSES.rdSequenceNum + 'iss' + FILENAME_RESPONSES.rdIssueNum;
}

/*
* 3. Get paths object based on filename
* Params: filename(string)
* Returns: object
*/
function getPaths(filename){
	var PATHS = {
		defaultPath:	'/torfps01.dehavilland.ca/techserv/structur/Documents/RDs(scanned)/',
		series8Folder:	'Q100-200-300',
		series84Folder:	'Q400',
		rootPath:		this.path.replace(this.documentFileName, '')
	};

	// Example filename: rd84-53-5264iss31
	var filenameArray	= filename.split('-');
	var seriesNum		= filenameArray[0].substring(2);	// Numbers after 'rd'
	var ataChapterNum	= filenameArray[1];					// Numbers between '-'

	if (seriesNum === '8') {
		PATHS.seriesFolder = PATHS.series8Folder;
	} else if (seriesNum === '84') {
		PATHS.seriesFolder = PATHS.series84Folder;
	} else {
		console.println('Error: Incorrect series number entered');
	}

	PATHS.outputPath = PATHS.defaultPath + '/' + PATHS.seriesFolder + '/' + ataChapterNum + '/';

	return PATHS;
}

/*
* 4. Get the number of the last page of section 1
* Returns: integer
*/
function getSection1LastPage(){
	var SECTION_PROMPTS = [
		{
			promptLabel:		'sectionLastPage',
			promptQuestion:		'Enter the last page number of Section 1:',
			promptTitle:		'Section 1 - Last Page',
			promptDefaultValue:	''
		},
	];

	var SECTION_RESPONSES = askUserPrompts(SECTION_PROMPTS);

	return parseInt(SECTION_RESPONSES.sectionLastPage);
}

/*
* 5. Get outputs
* Params: filename(string), paths(object), sectionLastPage(integer)
* Returns: array
*/
function getOutputs(filename, paths, sectionLastPage){
	// Set Outputs
	var OUTPUTS = [
		{
			start:	0,
			end:	sectionLastPage - 1,
			path:	paths.rootPath + filename,
			suffix:	''
		},
		{
			start:	1,
			end:	sectionLastPage - 1,
			path:	paths.outputPath + filename,
			suffix:	'sect1'
		},
		{
			start:	sectionLastPage,
			end:	this.numPages - 1,
			path:	paths.outputPath + filename,
			suffix:	'sect2'
		},
	];

	return OUTPUTS;
}

/*
* 6. Extract PDFs
* Params: outputs(array)
*/
function extractPDFs(outputs){
	for (var j = 0; j < outputs.length; j++) {
		try {
			this.extractPages({ nStart: outputs[j].start, nEnd: outputs[j].end, cPath: outputs[j].path + outputs[j].suffix + '.pdf' });
		} catch (e) {
			console.println(e);
		}
	}
}

/*
* 7. Create Draft E-mail
* Params: filename(string)
*/
function createDraftEmail(filename){
	var EMAIL_PROMPTS = [
		{
			promptLabel:		'ADRNum',
			promptQuestion:		'Enter the ADR Number',
			promptTitle:		'ADR Number',
			promptDefaultValue:	''
		},
		{
			promptLabel:		'ADRUrgency',
			promptQuestion:		'Enter the Request Urgency (AOG, ODU, Urgent, Routine)',
			promptTitle:		'Urgency',
			promptDefaultValue:	''
		},
	];

	var EMAIL_RESPONSES = askUserPrompts(EMAIL_PROMPTS);

	app.mailMsg({
		bUI: true,
		cTo: 'thd@dehavilland.com',
		cCC: '',
		cSubject: EMAIL_RESPONSES.ADRUrgency + ' ' + EMAIL_RESPONSES.ADRNum,
		cMsg: 'THD,\n\nPlease forward attached ' + filename + ' to operator via ADR: ' + EMAIL_RESPONSES.ADRNum + '\n\nThanks and Regards'
	});
}

/*
* Prompt user with supplied prompts
* Params: prompts(array)
* Returns: object
*/
function askUserPrompts(prompts){
	var RESPONSES = {};

	for (var i = 0; i < prompts.length; i++) {
		try {
			RESPONSES[prompts[i].promptLabel] = app.response(prompts[i].promptQuestion, prompts[i].promptTitle, prompts[i].promptDefaultValue);
		} catch (e) {
			console.println(e);
		}
	}

	return RESPONSES;
}

/*
* Add button to toolbar
*/
app.addToolButton({
	cName:		'RD Extract and Save',
	cLabel:		'RD Extract and Save',
	cExec:		'rdExtractAndEmail()',
	cTooltext:	'Extract and Save Sect 1 & 2, Send RD to THD',
	cEnable:	true,
	nPos:		-1
});