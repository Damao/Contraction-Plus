<!DOCTYPE html>
<head>
    <meta charset="utf-8"/>
    <meta name="format-detection" content="telephone=no"/>
    <!-- WARNING: for iOS 7, rdivove the width=device-width and height=device-height attributes. See https://issues.apache.org/jira/browse/CB-4323 -->
    <meta name="viewport" content="initial-scale=1.0,maximum-scale=1,user-scalable=no">

    <meta name="apple-mobile-web-app-title" id="web-app-title" content="">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <link rel="apple-touch-icon" href="../img/touch-icon-iphone.png">

    <link rel="stylesheet" type="text/css" href="../css/style.css?v1.6"/>
    <title>宫缩+ Contraction+</title>
</head>
<body>

<div class="mod-page">
    嘛...微信什么的不允许直接下载 apk
    <div id="mod-readme" class="mod-readme">
        <div class="ui-padding-medium">
            <div id="mod-readme-color" class="mod-readme__title">请右上角菜单</div>
            <div id="mod-readme-color-detail" class="mod-readme__item">选择在浏览器中打开</div>
        </div>
    </div>
</div>
<script type="text/javascript" src="../js/appframework.min.js"></script>
<?php
$user_agent = $_SERVER['HTTP_USER_AGENT'];
if (strpos($user_agent, 'MicroMessenger') === false) {
    ?>
    <script>
        if (confirm("即将开始下载 宫缩+")) {
            window.location.href = "../../../android.apk";
        }
    </script>
<?php
} else {
?>
    <script>
        $("#mod-readme").attr("style", "display:block;opacity:1;");
    </script>
<?php
}
?>


</body>
</html>
