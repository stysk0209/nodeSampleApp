### ログイン認証システム
---
- ***開発環境***
	- nodejs: v10.13.0
	- express: v4.16.1
	- sequelize: v4.23.0
	- DB: postgreSQL

### 実装した機能概要
---
- ユーザアカウントを作成する機能  
- ログイン画面からログインする機能  
- ログイン後、ログイン後の画面(マイページ)を表示する機能  
- データベースに保存されたアカウント情報を盗まれた場合に、被害を少なくするための機能
	- ユーザのパスワードをハッシュ化して保存
- 悪意のある別サイトからのPOST処理を防ぐ機能
	- ユーザアカウント作成画面に認証用のtokenを埋め込み、POST処理時に認証する
- ログインした状態でアプリケーションを再起動しても、ログイン状態が維持できる機能
	- ログイン時にログイン情報(暗号化したもの)をCookieへ保存し、セッションを管理
- ログインしていない状態でログイン後の画面のURLを入力された場合にログイン画面を表示し、  
  ログイン後に入力されたURLの画面を表示する機能
  	- 未ログイン時に users/:id/test(テストページ) へアクセスしようとした場合に、ログイン処理を促し、  
  	  ログイン後にテストページを表示する。  
  	  ※通常のログイン時は、マイページへ遷移

### 実装したが、理解できていない点
---
- sequelizeの使用方法
	- Modelへバリデーションの記述をしても反映されない(.sync({force: false, alter: true})で再定義？)
- express-session のオプション設定