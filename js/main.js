$(function(){

    var editorPage = new EditorPage();
    editorPage.init();

	var aceEditor = new ACEEditor("editor");
    var tabPanel = new TabPanel("top-panel");
    
    tabPanel.init(aceEditor);
    aceEditor.init(tabPanel);

    var fileTree = new FileTree('filetree');
    fileTree.init(aceEditor, tabPanel);
});
