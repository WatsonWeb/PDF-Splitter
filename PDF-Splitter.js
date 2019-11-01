// PDF Splitter
var RESPONSES = {};
var FILENAME;
var OUTPUTS = ['', 'sect1', 'sect2'];
var PATHS = {
	defaultPath: '/T/Documents/RDs(scanned)',
	series8Folder: 'Q100-200-300',
	series84Folder: 'Q400'
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
FILENAME = 'rd' + RESPONSES.seriesNum + '-' + RESPONSES.ataChapterNum + '-' + RESPONSES.rdSequenceNum + 'iss' + RESPONSES.rdIssueNum;

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
PATHS.rootPath = this.path.replace(this.documentFileName, ''); 
RESPONSES.sectionLastPage = parseInt(RESPONSES.sectionLastPage);

// Split the PDF
for (var j = 0; j < OUTPUTS.length; j++) {

	// First PDF
	if (j === 0) {
		
		try {
			this.extractPages({ nStart: 0, nEnd: RESPONSES.sectionLastPage - 1, cPath: PATHS.rootPath + FILENAME + OUTPUTS[j] + '.pdf' });
		} catch (e) {
			console.println(e);
		}
	}

	// Second PDF
	else if (j === 1) {
		try {
			this.extractPages({ nStart: 1, nEnd: RESPONSES.sectionLastPage - 1, cPath: PATHS.outputPath + FILENAME + OUTPUTS[j] + '.pdf' });
		} catch (e) {
			console.println(e);
		}
	}

	// Third PDF
	else if (j === 2) {
		try {
			this.extractPages({ nStart: RESPONSES.sectionLastPage, nEnd: this.numPages - 1, cPath: PATHS.outputPath + FILENAME + OUTPUTS[j] + '.pdf' });
		} catch (e) {
			console.println(e);
		}
	}
}
