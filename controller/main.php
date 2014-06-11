<?php
class main extends spController
{
	function index(){
		$this->display('index.html');
	}

	/**
	 * 获取目录文件列表
	 * @param string $dirpath // 目录路径,从根目录起
	 * @return json 
	 */
	public function getFileList(){
		$dirpath = $this->spArgs('dirpath');
		$dirpath = $dirpath ? $dirpath : '/';
		$paths = explode('/..', $dirpath);
		$basepath = $paths[0];
		for ($i = 0; $i < count($paths) - 1; ++$i){
			$basepath = dirname($basepath);
		}
		$basepath = '/' . trim(trim($basepath, '/'), '\\');
		$realDirPath = rtrim(rtrim(ROOT_PATH,'/') . $basepath, '/');
		if (is_dir($realDirPath)){
			$result = array(
				'path' => $basepath,
				'fileList' => $this->_listDir($realDirPath, $basepath)
				);
		} else {
			$result = array(
				'errno' => 10030,
				'errmsg' => 'folder not exist'
				);
		}
		
		echo json_encode($result);
	}

	/**
	 * 获取文件内容及相关文件信息
	 * @param string filepath // 文件路径
	 * @return json
	 */
	public function getFile(){
		$filepath = $this->spArgs('filepath');
		$filepath = '/' . trim(trim($filepath, '/'), '\\');
		$realFilePath = rtrim(rtrim(ROOT_PATH,'/') . $filepath, '/');
		if (file_exists($realFilePath) && !is_dir($realFilePath)){
			$result = array(
				'errno' => 0,
				'res' => $this->_getFileInfo($realFilePath)
				);
		} else {
			$result = array(
				'errno' => 10031,
				'errmsg' => 'file not exist'
				);
		}
		echo json_encode($result);
	}

	public function saveFile(){
		$filePath = $this->spArgs('filePath');
		$fileContent = $this->spArgs('fileContent');
		$filePath = '/' . trim(trim($filePath, '/'), '\\');
		$realFilePath = rtrim(rtrim(ROOT_PATH,'/') . $filePath, '/');
		$fp = fopen($realFilePath, 'w');
		if (!$fp){
			echo "Failed";
		} else {
			fwrite($fp, $fileContent);
			fclose($fp);
			echo "Save File OK!";
		}
	}

	/**
	 * 获取文件信息
	 * @param string $filepath // 文件路径
	 * @return array $result 
	 *				// content => 文件内容
	 * 				// ext => 文件扩展名
	 *				// 
	 */
	private function _getFileInfo($filepath){
		if (is_readable($filepath)) {
			$content = file_get_contents($filepath);
		}
		$result = array(
			'content' => $content,
			'ext' => $this->_getFileExtension(basename($filepath))
			);
		return $result;
	}

	/**
	 * 获取文件扩展名
	 * @param string $filename // 文件名
	 * @return string $ext // 扩展名
	 */
	private function _getFileExtension($filename){
		$ext = strtolower(array_pop(explode('.',$filename)));
		return $ext;
	}

	/**
	 * 列出目录中的文件以及文件属性
	 * @param $dir // the real path of the folder to be list
	 * @param $basepath // the path to be show to front end
	 */
	private function _listDir($dir, $basepath){
		$dir = rtrim($dir, '/');
		$fileNameList = scandir($dir);
		$fileList = array();
		foreach($fileNameList as $fileName){
			// 不显示'.',以及以'.'开头的文件('..'除外)
			if ($fileName[0] != '.' || $fileName == '..'){
				$isDir = is_dir("$dir/$fileName") ? true : false;
				$isReadable = is_readable("$dir/$fileName") ? true : false;
				$isWritable = is_writable("$dir/$fileName") ? true : false;
				$file = array(
					'isdir' => $isDir, 
					'readable' => $isReadable, 
					'writable' => $isWritable, 
					'filename' => $fileName,
					'path' => rtrim($basepath, '/') . '/' . $fileName
					);
				array_push($fileList, $file);
			}
		}
		return $fileList;
	}
}