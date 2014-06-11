<?php
define("BASEPATH",'.');
define("APP_PATH",dirname(__FILE__));
define("SP_PATH",dirname(__FILE__).'/SpeedPHP');
define("ROOT_PATH", APP_PATH);
define("SKIP_PATH", APP_PATH);
define("JS_PATH", BASEPATH . "/js");
define("CSS_PATH", BASEPATH . "/themes/default/css");
define("IMG_PATH", BASEPATH . "/themes/default/images");
define("ACE_PATH", JS_PATH . "/3rdparty/ace/src-min-noconflict");

$spConfig = array(
	'mode' => 'release',
	'default_controller' => 'main',
	'default_action' => 'index',
	'url_controller' => 'c',
	'url_action' => 'a',

	'db' => array(
		'driver' => 'mysql',
		'host' => 'localhost',
		'port' => 3306,
		'login' => 'developer',
		'password' => 'developer',
		'database' => 'developer',
		'persistent' => false
		),
	'view' => array( // 视图配置
				'enabled' => TRUE, // 开启视图
				'config' =>array(
						'template_dir' => APP_PATH.'/template', // 模板目录
						'compile_dir' => APP_PATH.'/tmp', // 编译目录
						'cache_dir' => APP_PATH.'/tmp', // 缓存目录
						'left_delimiter' => '<{',  // smarty左限定符
						'right_delimiter' => '}>', // smarty右限定符
						'auto_literal' => TRUE, // Smarty3新特性
						),
				'debugging' => FALSE, // 是否开启视图调试功能，在部署模式下无法开启视图调试功能
				'engine_name' => 'Smarty', // 模板引擎的类名称，默认为Smarty
				'engine_path' => SP_PATH.'/Drivers/Smarty/Smarty.class.php', // 模板引擎主类路径
				'auto_ob_start' => TRUE, // 是否自动开启缓存输出控制
				'auto_display' => FALSE, // 是否使用自动输出模板功能
				'auto_display_sep' => '/', // 自动输出模板的拼装模式，/为按目录方式拼装，_为按下划线方式，以此类推
				'auto_display_suffix' => '.html', // 自动输出模板的后缀名
				),
	'include_path' => array(
		APP_PATH.'/include'
		)
	);
require(SP_PATH."/SpeedPHP.php");
require_once("./config.php");
spRun();