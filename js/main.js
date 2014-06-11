$(function(){

    var editorPage = new EditorPage();
    editorPage.init();

	var aceEditor = new ACEEditor("editor");
	aceEditor.init();
	
    var tabPanel = new TabPanel("top-panel", aceEditor);

    var fileTree = new FileTree('filetree');
    fileTree.init(aceEditor, tabPanel);
});
