# このリポジトリの目的

Githubのgh-pagesで公開可能なページを格納しておくページ。  
JavaScriptの検証や、それに基づいたライブラリなどを公開する。

# JavaScript Library
## License

MIT License

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
        印刷、ファイル共有を前提に作っている。
    * http://ksgwr.github.io/GitHubHtml/app/NotePaper/index.html
    * 使用技術
       * canvas
       * rangy キャレット制御
       * 画像のDrag&Drop
       * css scale
       * 角丸描写(どこで利用しているか忘れた、恐らく定規ツールを作ろうとして機能としては未実装?)
       * FileAPI
* PassManager
    * 特徴
        * パスワードを管理するアプリ。パスワードはLocalStorageで暗号化され保存する
    * http://ksgwr.github.io/GitHubHtml/app/PassManager/index.html
    * 使用技術
        * 公開鍵暗号方式
        * css画像変更, 画像埋め込み
* D3InteractiveGraph
    * 特徴
      * 機械学習系のデータをインタラクティブに分析する、大規模データを想定し、
        拡大した時のみラベル名を出すなど
    * http://ksgwr.github.io/GitHubHtml/app/D3InteractiveGraph/index.html
    * 使用技術
      * d3.js (zoom, brush)
      * React

* A-Frame
    * 特徴
        * A-Frameを利用してGoogle Street Viewの動作を模倣する。VRでなくマウスの操作を前提とする。
          天球画像はGoogleMapのアプリでも取ることができ、完全な3Dモデルでなく実写重視の作り
    * http://ksgwr.github.io/GitHubHtml/app/A-Frame/index.html
    * 使用技術
       * A-Frame
       * A-Frame HTML Shader
