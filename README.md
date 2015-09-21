# JavaScript Library
## License

基本的にMIT Licenseで公開します

## 入力補助ライブラリ
### 特徴

日本語入力の場合、変換途中の文字はchangesイベントが発生しないため、サジェストができない。
そのため、このライブラリでは固定時間でフィールド監視を行っている。
また、Ajaxや配列などの複数のデータソースの入力やイベントのハンドリングに対応している。

### 必要ファイル

* jQuery
* https://github.com/ksgwr/GitHubHtml/blob/master/js/suggest-0.0.1.js
* https://github.com/ksgwr/GitHubHtml/blob/master/css/suggests.css

### サンプルページ

* http://ksgwr.github.io/GitHubHtml/sample/suggest.html

# App based html

※未整理です。

* NotePaper
    * 特徴
        * Html単体で動作するメモ帳アプリ。Wordよりノートに書き込みするように自由に書き込めることや  
        印刷、ファイル共有を前提に作られています。
    * http://ksgwr.github.io/GitHubHtml/app/NotePaper/index.html
* PassManager
    * 特徴
        * パスワードを管理するアプリです。パスワードはLocalStorageで暗号化され保存されます
    * http://ksgwr.github.io/GitHubHtml/app/PassManager/index.html
