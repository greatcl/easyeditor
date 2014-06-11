var EditorTab = (function(){
	var EditorTab = function(tabId, fileInfo, tabPanel){
		this.parentPanel = tabPanel;
		this.tabId = 'tab_' + tabId;
		this.fileInfo = fileInfo;
	};

	EditorTab.prototype.init = function(){
		var self = this;
		var tab = $('<div class="editor-tab editor-tab-current" id="' + this.tabId + '"><div>' + this.fileInfo['fileName'] + '</div></div>');
		tab.on('click', function(){
			self.parentPanel.switchTab(self.tabId);
		});
		tab.on('dblclick', function(){
			self.closeTab(self.tabId);
		});
		return tab;
	};

	EditorTab.prototype.closeTab = function(tabId){
		$('#' + tabId).remove();
		var newTabId = this.parentPanel.removeFromTabList(tabId);
		if (!newTabId){ // there is no opened file
			this.parentPanel.aceEditor.clearEditorFile();
		} else {
			this.parentPanel.switchTab(newTabId);
		}
		// @todo remove file content cache, then switch tab
	};

	EditorTab.prototype.bindEvent = function(){

	};

	return EditorTab;
})();

var TabPanel = (function(){
	var TabPanel = function(divId, aceEditor){
		this.divId = divId;
		this.tabPanel = $('#' + divId);
		// if cookie is set, get from cookie, or init to 0
		this.tabId = 0;
		this.fileList = [];
		this.aceEditor = aceEditor;
	};

	TabPanel.prototype.addTab = function(fileInfo){
		var thisTabId = 'tab_' + this.tabId;
		$('.editor-tab-current').removeClass('editor-tab-current').addClass('editor-tab-normal');
		var editorTab = new EditorTab(this.tabId, fileInfo, this);
		this.tabPanel.append(editorTab.init());
		this.fileList.push({'filePath': fileInfo['filePath'], 'tabId' : 'tab_' + this.tabId});
		this.tabId += 1;
		return thisTabId;
	};

	TabPanel.prototype.isTabExist = function(filePath){
		for(var i in this.fileList){
			if (this.fileList[i]['filePath'] == filePath){
				return this.fileList[i]['tabId'];
			}
		}
		return false;
	};

	TabPanel.prototype.switchTab = function(tabId){
		$('.editor-tab-current').removeClass('editor-tab-current').addClass('editor-tab-normal');
		$('#' + tabId).addClass('editor-tab-current');
		// load file content
		this.aceEditor.loadFileContent(tabId);
	};

	TabPanel.prototype.removeFromTabList = function(tabId){
		for(var i in this.fileList){
			if (this.fileList[i]['tabId'] == tabId){
				this.fileList.splice(i, 1);
				break;
			}
		}
		
		// delete file cache
		this.aceEditor.removeFileCache(tabId);
		
		// there is no opened file
		if (this.fileList.length == 0){
			return false;
		}

		// the file that be closed is the last file in the opened file list
		if (i == this.fileList.length){
			--i;
		}
		return this.fileList[i]['tabId'];
	};

	return TabPanel;
})();

var EditorPage = (function(){
	var EditorPage = function(){
	};

	EditorPage.prototype.init = function(){
		this.autoSize();
		this.bindEvent();
	};

	EditorPage.prototype.autoSize = function(){
		// height
		var win_h = $(window).height();
    	var filelist_pos = $('#filelist').position();
    	var h = win_h - filelist_pos.top;
    	$('#treecontainer').height(h - $('.treeinfo').height() - 1);

    	// width
    	var win_w = $(window).width();
    	var left_w = $('div.left').width();
    	var w = win_w - left_w - 1;
    	// $('div.right').width(w);
    	// $('div.top-panel').width(w-1);
	};

	EditorPage.prototype.bindEvent = function(){
		var self = this;
		$(window).resize(function(){
			self.autoSize();
		});
	};

	return EditorPage;
})();

var ACEEditor = (function(){
	var ACEEditor = function(editorId){
		this.editorId = editorId;
		this.editor = ace.edit(editorId);
	};

	ACEEditor.prototype.init = function(){
		var self = this;
		this.editor.setReadOnly(true);
	    this.editor.commands.addCommand({
	    	name : 'Save',
	    	bindKey: {win: 'Ctrl-S', mac: 'Command-S'},
	    	exec: function(editor){
	    		self.saveFile();
	    	},
	    	readOnly: false
	    });
	    this.setFontSize('14px');
		this.setTheme();
	};

	ACEEditor.prototype.saveFile = function(){
		this.updateCacheFile(this.tabId, this.editor.getValue());
		$.post('./index.php?c=main&a=saveFile',{
			'filePath' : this.filePath,
			'fileContent' : this.editor.getValue()
		}, function(result){
			alert(result);
		});
	};

	ACEEditor.prototype.setTheme = function(themeName){
		if (!themeName){
			// get theme from cookie
			themeName = '';
			if (!themeName){
				themeName = 'ace/theme/monokai';
			}
			this.setTheme(themeName);
		}
		this.editor.setTheme(themeName);
		// @todo set current theme to cookie
	};

	ACEEditor.prototype.setFontSize = function(fontSize){
		if (!fontSize){
			fontSize = '12px';
		}
		document.getElementById(this.editorId).style.fontSize=fontSize;
	};

	ACEEditor.prototype.getAceMode = function(extension){
		var ace_mode={c:"c_cpp",cpp:"c_cpp",css:"css",html:"html",htm:"html",ini:"ini",java:"java",js:"javascript",json:"json",jsp:"jsp",md:"markdown",php:"php",py:"python",sh:"sh",sql:"sql",txt:"text",xml:"xml"}
		if (extension == ''){
			return 'plain_text';
		} else if (!extension){
			return false;
		} else if (ace_mode[extension]){
			return ace_mode[extension];
		} else {
			return 'text';
		}
	};

	ACEEditor.prototype.openFile = function(filePath, tabPanel){
		var self = this;
		var tabId = tabPanel.isTabExist(filePath);
		if (!tabId){
			tabId = tabPanel.addTab({'fileName' : filePath.split('/').pop(), 'filePath' : filePath});
			$.getJSON('./index.php?c=main&a=getFile',{
				'filepath' : filePath
			}, function(result){
				var fileDiv = '<textarea tabId="' + tabId + '" filePath="' + filePath + '"></textarea>';
				$('#fileCache').append(fileDiv);
				$('[tabId="' + tabId + '"]').val(result['res']['content']);
				self.loadFileContent(tabId);
			});
		} else {
			tabPanel.switchTab(tabId);
		}

		this.filePath = filePath;
		this.tabId = tabId;
	};

	ACEEditor.prototype.loadFileContent = function(tabId){
		var fileContent = $('[tabId="' + tabId + '"]').val();
		var filePath = $('[tabId="' + tabId + '"]').attr('filePath');
		
		this.editor.setReadOnly(false);
		this.editor.getSession().setMode("ace/mode/" + this.getAceMode(filePath.split('.').pop()));
		this.editor.setValue(fileContent);
		this.editor.clearSelection();
		this.editor.focus();
	};

	ACEEditor.prototype.updateCacheFile = function(tabId, fileContent){
		$('[tabId="' + tabId + '"]').val(fileContent);
	};

	ACEEditor.prototype.removeFileCache = function(tabId){
		$('[tabId="' + tabId + '"]').remove();
	};

	ACEEditor.prototype.clearEditorFile = function(){
		this.editor.setReadOnly(true);
		this.editor.setValue('');
		this.editor.getSession().setMode("ace/mode/text");
		this.editor.focus();
	};

	return ACEEditor;
})();

var FileTree = (function(){
	var FileTree = function(treeId){
		this.treeId = treeId;
		this.fileTree = $('#'+treeId);
		this.currentPath = '/';
	};

	FileTree.prototype.init = function(aceEditor, tabPanel){
		this.aceEditor = aceEditor;
		this.tabPanel = tabPanel;
		this.getDirList(this.currentPath);
	};

	FileTree.prototype.buildTree = function(fileList){
		var treeshow = '';
		for (var file in fileList){
			var isdir = fileList[file].isdir,
			    read = fileList[file].readable,
			    write = fileList[file].writable,
			    fileName = fileList[file].filename,
				path = fileList[file].path;
			if (fileName){
				if (isdir){
					if (!(this.currentPath == '/' && fileName == '..')){
						treeshow += '<li title="' + (fileName == '..' ? '上一级' : fileName) + '" class="dir" type="dir">'
							 + '<div write=' + write + ' read = ' + read + ' path = "' + path + '" filename = "' + fileName + '">'
							 + '' + fileName 
							 + '</div></li>';
					}
				} else {
					treeshow += '<li title="' + fileName + '" class="file" type="file">'
							 + '<div write=' + write + ' read = ' + read + ' path = "' + path + '" filename = "' + fileName + '">'
							 + '' + fileName 
							 + '</div></li>';
				}
			}
		}

		$('#currentPath').html(this.currentPath);
		$('#currentPath').attr('title', this.currentPath);
		this.fileTree.html(treeshow);
	};

	FileTree.prototype.getDirList = function(dirPath){
		var self = this;
		$.getJSON('./index.php?c=main&a=getFileList',{
			'dirpath' : dirPath
		},function(result){
			self.currentPath = result.path;
			self.buildTree(result['fileList']);

			self.bindEvent();
		});
	};

	FileTree.prototype.bindEvent = function(){
		var self = this;
		$('#filetree li').each(function(){
			$(this).on('click', function(event){
				$('li.selected').removeClass('selected');
				$(this).addClass('selected');
			});

			$(this).on('dblclick', function(){
				var filetype = $(this).attr('type');
				var fileName = $(this).find('div').attr('filename');
				var filePath = $(this).find('div').attr('path');
				var thispath = (self.currentPath == '/' ? '/' : self.currentPath + '/') + $(this).find('div').html();
				if(filetype == 'dir'){
					self.getDirList(thispath);
				} else if(filetype == 'file'){
					self.aceEditor.openFile(thispath, self.tabPanel);
				}
			});
		});
	};

	return FileTree;
})();