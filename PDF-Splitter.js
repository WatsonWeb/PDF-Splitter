// PDF Splitter
var RESPONSES = {};
var PATHS = {
	defaultPath: '/T/Documents/RDs(scanned)',
	series8Folder: 'Q100-200-300',
	series84Folder: 'Q400',
	rootPath: this.path.replace(this.documentFileName, '')
};
var PROMPTS = [
	{
		promptLabel: 'seriesNum',
		promptQuestion: 'Enter the aircraft Series Number:\nS100-S200-S300 = 8\nS400 = 84',
		promptTitle: 'Aircraft Series Number',
		promptDefaultValue: ''
	},
	{
		promptLabel: 'ataChapterNum',
		promptQuestion: 'Enter the aircraft ATA Chapter:',
		promptTitle: 'Aircraft ATA Chapter',
		promptDefaultValue: ''
	},
	{
		promptLabel: 'rdSequenceNum',
		promptQuestion: 'Enter the aircraft RD Sequence Number:',
		promptTitle: 'Aircraft RD Sequence Number',
		promptDefaultValue: ''
	},
	{
		promptLabel: 'rdIssueNum',
		promptQuestion: 'Enter the aircraft RD Issue Number:',
		promptTitle: 'Aircraft RD Issue Number',
		promptDefaultValue: ''
	},
	{
		promptLabel: 'sectionLastPage',
		promptQuestion: 'Enter the last page number of Section 1:',
		promptTitle: 'Section 1 - Last Page',
		promptDefaultValue: ''
	},
	{
		promptLabel: 'rootOutputPath',
		promptQuestion: 'Enter the output path:\nExample: /T/Documents/RDs(scanned)',
		promptTitle: 'Output Path',
		promptDefaultValue: PATHS.defaultPath
	}
];

// Gather prompt responses
for (var i = 0; i < PROMPTS.length; i++) {
	try {
		RESPONSES[PROMPTS[i].promptLabel] = app.response(PROMPTS[i].promptQuestion, PROMPTS[i].promptTitle, PROMPTS[i].promptDefaultValue);
	} catch (e) {
		console.println(e);
	}
}

// Set Filename
var FILENAME = 'rd' + RESPONSES.seriesNum + '-' + RESPONSES.ataChapterNum + '-' + RESPONSES.rdSequenceNum + 'iss' + RESPONSES.rdIssueNum;

// Set Series Folder
if (RESPONSES.seriesNum === '8') {
	PATHS.seriesFolder = PATHS.series8Folder;
} else if (RESPONSES.seriesNum === '84') {
	PATHS.seriesFolder = PATHS.series84Folder;
} else {
	console.println('Error: Incorrect series number entered');
}

// Set Output Paths
PATHS.outputPath = RESPONSES.rootOutputPath + '/' + PATHS.seriesFolder + '/' + RESPONSES.ataChapterNum + '/';
RESPONSES.sectionLastPage = parseInt(RESPONSES.sectionLastPage);

// Set Outputs
var OUTPUTS = [
	{
		start: 0,
		end: RESPONSES.sectionLastPage - 1,
		path: PATHS.rootPath + FILENAME,
		suffix: ''
	},
	{
		start: 1,
		end: RESPONSES.sectionLastPage - 1,
		path: PATHS.outputPath + FILENAME,
		suffix: 'sect1'
	},
	{
		start: RESPONSES.sectionLastPage,
		end: this.numPages - 1,
		path: PATHS.outputPath + FILENAME,
		suffix: 'sect2'
	},
];

// Split the PDF
for (var j = 0; j < OUTPUTS.length; j++) {

	try {
		this.extractPages({ nStart: OUTPUTS[j].start, nEnd: OUTPUTS[j].end, cPath: OUTPUTS[j].path + OUTPUTS[j].suffix + '.pdf' });
	} catch (e) {
		console.println(e);
	}
}
