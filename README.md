# Web Speed Hackathon 2023 Leaderboard (for 2025 practice)

**"Web Speed Hackathon 2023" は、非常に重たい Web アプリをチューニングして、いかに高速にするかを競う競技です。**

今回のテーマは、架空のショッピングサイト「買えるオーガニック」です。
「買えるオーガニック」のパフォーマンスを改善してください。

- 課題レポジトリ: <https://github.com/CyberAgentHack/web-speed-hackathon-2023>

## 開催期間

2025/02/08 10:00 JST - 2023/03/31 23:59 JST

## 参加登録

### リポジトリ準備

まず、 GitHub 上で新しくリポジトリを作ってください。
ここでは、 `wsh2023-practice-2025` という名前で作成したと仮定します。

次に、上記課題レポジトリを clone しましょう。

```bash
git clone https://github.com/CyberAgentHack/web-speed-hackathon-2023.git
```

`web-speed-hackathon-2023` ディレクトリが生成されるはずです。
git remote を変更するための以下のコマンドを実行します。
適宜新しく作り変えたレポジトリ名に変更してください。

```bash
cd web-speed-hackathon-2023
git remote set-url origin https://github.com/<username>/<repo>.git
# 例: https://github.com/a01sa01to/wsh2023-practice-2025.git
```

念のため、リモートリポジトリが変更されたか確認しておきます。

```bash
git remote -v
# どちらも以下のような表示になれば OK
# origin  https://github.com/<username>/<repo>.git
```

最後に、リモートリポジトリに push します。

```bash
git push origin main
```

これで、リポジトリの準備が整いました。

### 開発方法

課題リポジトリの README を参照してください

### デプロイ

Koyeb にデプロイする場合を例に説明します。
もしかしたら UI が変わっているかもしれません。

1. Koyeb にログインし、左サイドバーの Create Service をクリック
2. Web service -> GitHub
3. (もし表示されている場合は) Install GitHub App をクリックして GitHub と連携
4. リポジトリを選択
5. Free にしておく　 Region はなんでも
6. Builder に Dockerfile を指定
7. Exposed ports は `8080` を指定

これで Deploy 押してしばらくすると完了していると思います

### 計測

- アプリケーションをデプロイして URL を用意します
- このレポジトリの issue から参加登録します
- もう一度計測する場合は、issue に `/retry` とコメントします

## リーダーボード

<!-- leaderboard:start -->
<!-- leaderboard:end -->

---

このツールは独自実装です。
Creative Commons 4.0 BY-NC-SA ライセンスで提供します。

README において一部 [CyberAgentHack/web-speed-hackathon-2023-scoring-tool](https://github.com/CyberAgentHack/web-speed-hackathon-2023-scoring-tool) を引用しました。
