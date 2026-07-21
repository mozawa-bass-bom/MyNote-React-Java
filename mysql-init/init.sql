-- MySQL dump 10.13  Distrib 8.4.7, for Win64 (x86_64)
--
-- Host: localhost    Database: notes_app
-- ------------------------------------------------------
-- Server version	8.4.7

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `prompt_1` text,
  `prompt_2` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_categories_user` (`user_id`),
  CONSTRAINT `fk_categories_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,1,'仕事','要約を生成','詳細解説を追加','2025-08-21 11:12:29','2025-11-04 10:41:45'),(2,1,'プライベート','情緒的に','短めに箇条書きでまとめて','2025-08-21 11:12:29','2025-11-03 18:44:33'),(4,1,'趣味','情緒的に','簡潔に専門用語を解説','2025-08-21 11:12:29','2025-11-03 19:45:46'),(6,2,'研究',NULL,NULL,'2025-08-21 11:12:29','2025-08-21 11:12:29'),(7,2,'生活',NULL,NULL,'2025-08-21 11:12:29','2025-08-21 11:12:29'),(8,2,'健康',NULL,NULL,'2025-08-21 11:12:29','2025-08-21 11:12:29');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contacts`
--

DROP TABLE IF EXISTS `contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contacts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_contacts_user` (`user_id`),
  CONSTRAINT `fk_contacts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contacts`
--

LOCK TABLES `contacts` WRITE;
/*!40000 ALTER TABLE `contacts` DISABLE KEYS */;
INSERT INTO `contacts` VALUES (1,1,'山田 太郎','yamada@example.com','アカウントに関する質問があります。','2025-08-21 11:12:29'),(2,2,'佐藤 花子','sato@example.com','ノートが表示されません。','2025-08-21 11:12:29'),(3,NULL,'ゲスト1','guest1@example.com','ログインできません。','2025-08-21 11:12:29'),(4,NULL,'ゲスト2','guest2@example.com','問い合わせテストです。','2025-08-21 11:12:29'),(5,1,'山田 太郎','yamada@example.com','カテゴリ編集について質問です。','2025-08-21 11:12:29');
/*!40000 ALTER TABLE `contacts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `note_index`
--

DROP TABLE IF EXISTS `note_index`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `note_index` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `note_id` bigint NOT NULL,
  `index_number` int NOT NULL,
  `start_index` int NOT NULL,
  `end_index` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `body` text,
  PRIMARY KEY (`id`),
  KEY `fk_note_index_note` (`note_id`),
  CONSTRAINT `fk_note_index_note` FOREIGN KEY (`note_id`) REFERENCES `notes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `note_index`
--

LOCK TABLES `note_index` WRITE;
/*!40000 ALTER TABLE `note_index` DISABLE KEYS */;
INSERT INTO `note_index` VALUES (1,1,1,1,1,'総合手順','業務マニュアルの全体概要'),(2,2,1,1,1,'会議概要','会議の概要'),(3,3,1,1,1,'旅行概要','旅行計画の概要'),(7,11,1,1,1,'AI研究概要','研究のポイント'),(8,13,1,1,1,'リスト概要','買い物リストのまとめ'),(15,24,1,1,4,'認証・登録関連画面','<p>ログイン画面、ユーザー登録画面、パスワードリセット画面、パスワード再設定画面について定義されています。</p><hr/><ul>\n<li>各画面のURL、クラス名、テンプレートファイル名が記載されています。</li>\n<li>ユーザーアクションと対応する機能IDが記述されています。</li>\n<li>バリデーションや入力チェックなど、フロント処理に関する備考があります。</li>\n</ul>'),(16,24,2,5,7,'管理者用画面','<p>管理者用共通ヘッダー、ユーザー管理画面、お問い合わせ表示画面について定義されています。</p><hr/><ul>\n<li>共通ヘッダーには、リンクとログアウトボタンがあります。</li>\n<li>ユーザー管理画面では、ユーザーの一覧表示と削除が可能です。</li>\n<li>お問い合わせ表示画面では、お問い合わせ内容の一覧表示と削除が可能です。</li>\n<li>テーブル表示、削除ボタン、確認モーダルが使用されています。</li>\n</ul>'),(17,24,3,8,12,'ユーザー用画面','<p>ユーザー用共通ヘッダー、PDFアップロード画面、カテゴリ+ノート管理画面、ノート詳細・編集画面、設定画面について定義されています。</p><hr/><ul>\n<li>共通ヘッダーには、リンクボタンとカテゴリ一覧表示があります。</li>\n<li>PDFアップロード画面では、PDFファイル、プロンプト、カテゴリを一括入力できます。</li>\n<li>カテゴリ+ノート管理画面では、カテゴリの追加・編集・削除と、該当カテゴリのノート一覧表示が可能です。</li>\n<li>ノート詳細・編集画面では、ノートの本文、画像、注釈を表示・編集できます。</li>\n<li>設定画面では、アカウント削除、問い合わせ、著作権の注意点が表示されます。</li>\n</ul>'),(18,24,4,13,14,'お問い合わせ関連画面','<p>お問い合わせフォーム画面、お問い合わせ内容確認画面について定義されています。</p><hr/><ul>\n<li>お問い合わせフォーム画面では、送信者とメール内容を入力します。</li>\n<li>お問い合わせ内容確認画面では、入力内容を確認し、送信します。</li>\n</ul>'),(19,25,1,2,3,'はじめに/目次','<p>このドキュメントの目的と対象読者、使用する略語、JDK17移行に伴うGCとその他の留意事項について説明します。</p><hr/><ul>\n<li>対象読者はJDK17を使用しシステムを設計・構築・運用する立場の人です。</li>\n</ul>'),(20,25,2,4,6,'JDK17 への移行に伴う留意事項','<p>JDK17への移行に伴うGC(ガベージコレクション)の変更点とその他の留意事項について解説します。デフォルトGCの変更、明示管理ヒープ機能の非サポート化について説明します。</p><hr/><ul>\n<li>ZGCが選択可能になり、G1GCがデフォルトGCに変更されました。</li>\n<li>明示管理ヒープ機能は非サポートになったため、Java VMオプションを削除する必要があります。</li>\n</ul>'),(21,25,3,7,8,'JDK17 への移行に伴うその他の留意事項','<p>JDK17への移行に伴う、GC以外の留意事項について説明します。クラスファイルのバージョン、javacコマンドのオプション、sun.nio.cs.mapシステムプロパティの削除、内部APIへのアクセス制限厳格化などが含まれます。</p><hr/><ul>\n<li>クラスファイルのバージョンが61になりました。</li>\n<li>javacコマンドのsource/target/releaseオプションに指定できる値が変更されました。</li>\n<li>sun.nio.cs.mapシステムプロパティが削除されました。</li>\n<li>内部APIへのアクセス制限が厳格化され、--add-opensオプションが必要になる場合があります。</li>\n</ul>'),(30,50,1,1,1,'悲劇の予感','モーツァルトのピアノ協奏曲第20番ニ短調は、彼の数少ない短調作品の一つです。\n\n発表当時の常識を覆す情熱的な表現は「デモーニッシュ（悪魔的）」と評され、19世紀のロマン派時代に特に愛奏されました。\n\nベートーヴェンもこの曲を愛し、カデンツァを作曲したほどです。\n\n第1楽章の陰鬱なシンコペーションから始まり、第2楽章の穏やかなロマンスを経て、第3楽章ではピアノとオーケストラが対等に渡り合う革新的な構成が見られます。\n\nこの作品は、ロマン主義の到来を告げるような、感情豊かな魅力を放っています。'),(31,50,2,1,2,'愛と変革の調べ','マーラーの交響曲第5番は、彼にとって20世紀に書かれた最初の交響曲であり、人生の大きな転換期に生み出されました。\n\nウィーン・フィル首席指揮者を辞任し、その後、運命の女性アルマ・シントラーと出会い、結婚した時期と重なります。\n\nこの作品は、歌曲集に起源を持つ声楽付き交響曲から「純粋器楽」への転換を象徴し、「新しいマーラー」の幕開けを告げるものとされています。\n\n特に第4楽章「アダージェット」は、アルマへの愛の証とされており、その切なくも美しい旋律は多くの人々に愛されています。'),(32,50,3,2,2,'魂の旅路','マーラー交響曲第5番は、全体として「葬送」から「勝利」へと向かう壮大な流れを持ちながらも、ベートーヴェンのそれとは異なる、パロディのような様相を呈しています。\n\n第1楽章は荘重な葬送行進曲で始まり、第2楽章は「マーラーの自我と世界との戦い」を表現した激しい音楽です。\n\n第3楽章「スケルツォ」ではホルンが活躍し、まるでホルン協奏曲のような趣があります。\n\n第4楽章「アダージェット」はハープと弦楽器のみで奏でられる天国的な美しさで、アルマへの愛が込められています。\n\n最終楽章のロンド・フィナーレは、多くのフーガが挿入され、バッハ体験が色濃く反映された勝利の喜びで締めくくられます。'),(33,50,4,2,3,'運命への問い','マーラーの交響曲第6番「悲劇的」は、彼の「中期」に書かれた純粋器楽作品でありながら、きわめて古典的なスタイルへの回帰が見られます。\n\nこの作品は、マーラーが家庭生活、指揮者としてのキャリアともに絶頂期にあった、まさに幸福の最中に作曲されました。\n\nしかし、彼の全交響曲の中で唯一、短調のまま悲劇的に終わるという特徴を持ち、しばしば彼のその後の運命を予言した作品とされています。\n\n長女の死や自身の心臓病発覚など、相次ぐ不幸を前にして、この作品が持つ厭世的テーマが当時のウィーンの時代の空気とも深く関連していると指摘されています。'),(34,50,5,3,3,'悲劇の兆し','マーラー交響曲第6番には、演奏上のいくつかの問題が存在します。\n\n特に中間楽章の順序や、最終楽章における「ハンマー」打撃の回数は、マーラー自身が悩んだ点であり、現在でも議論の対象となっています。\n\nこの作品を貫く重要な音楽的要素として、「示導リズム」と「示導和音」があります。\n\nこれらは、英雄の悲劇的宿命を音楽的に暗示し、「長調から短調へ」といった明暗の移り変わりを通じて、各楽章の要所を捉える手がかりとなります。\n\n第1楽章は「生と死」の葛藤を表現する大規模なソナタ楽章で、マーラーが妻アルマを思って書いたとされる「アルマの主題」も登場します。\n\n異次元のようなカウベルの響きも特徴です。'),(35,50,6,3,4,'響く魂の叫び','マーラー交響曲第6番の第2楽章「スケルツォ」は、第1楽章冒頭のリズムを変形したもので、「子供たちが砂の上をよちよち歩く様子」が描かれていますが、最後は悲しげに消え去ります。\n\n第3楽章は変ホ長調で、他の楽章と対極にある平和な世界を表現しますが、一抹の不安が影を落とします。\n\n最終楽章は30分を超える巨大なソナタ形式で、宿命的な「示導リズム」と「示導和音」が重要な役割を果たします。\n\nこの楽章で使われるハンマーは、英雄を打ち倒す武器のシンボルであり、タムタムも「死」を象徴する楽器として用いられます。\n\n興味深いことに、もともと3回あったハンマー打撃が2回に減らされ、3回目の箇所には「天国の楽器」チェレスタが加えられました。\n\nこれは「死」から「昇天」へ、あるいは「新たなはじまり」へと作品の意味がシフトした可能性を示唆しています。'),(36,51,1,1,1,'制作発表','「MyNote」というプロジェクトの制作発表のタイトルページです。\n作成者として小澤基良氏の名前が記載されています。'),(37,51,2,2,2,'使用技術','プロジェクト「MyNote」で使用されている技術スタックが紹介されています。\nフロントエンド、バックエンド、データベース、その他に分類され、具体的な技術名が列挙されています。'),(38,51,3,3,3,'工夫点','MyNoteの開発における主な工夫点が説明されています。\n状態管理、データ検証、エディタ機能の三つの観点から、それぞれ具体的な実装方法とその効果が述べられています。'),(39,51,4,4,4,'未実装機能','今後実装予定または検討中の機能がリストアップされています。\n管理者用ページ、キャッシュ管理、カテゴリソート機能、進行状況表示の改善などが含まれます。'),(40,51,5,5,5,'今後開発','フロントエンドにおける今後の制作予定が詳細に述べられています。\nデザイン、アニメーション、コンポーネント、テーマ、レスポンシブ対応といった項目ごとに計画が示されています。'),(41,51,6,6,6,'REST再設計','システムのREST化に伴う再設計項目が示されています。\n要件定義書からテスト詳細書までの各ドキュメントにおける変更点と、それらを通じてREST設計への適合を図る方針が説明されています。');
/*!40000 ALTER TABLE `note_index` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `note_pages`
--

DROP TABLE IF EXISTS `note_pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `note_pages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `note_id` bigint NOT NULL,
  `page_number` int NOT NULL,
  `firebase_public_url` varchar(500) DEFAULT NULL,
  `firebase_admin_path` varchar(255) DEFAULT NULL,
  `extracted_text` text,
  PRIMARY KEY (`id`),
  KEY `fk_note_pages_note` (`note_id`),
  CONSTRAINT `fk_note_pages_note` FOREIGN KEY (`note_id`) REFERENCES `notes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `note_pages`
--

LOCK TABLES `note_pages` WRITE;
/*!40000 ALTER TABLE `note_pages` DISABLE KEYS */;
INSERT INTO `note_pages` VALUES (1,1,1,'https://firebase/public/manual_page1.png','/admin/manual/page1','\\*業務手順 1ページ目\\*\n\n— 表示確認用ダミー追記 —\n・箇条書きA（表示/折返し確認）\n・箇条書きB（表示/折返し確認）\n\n\\\\| 項目 | 値 |\n\\\\| ---- | ---- |\n\\\\| A | 123 |\n\\\\| B | 456 |'),(2,2,1,'https://firebase/public/meeting_page1.png','/admin/meeting/page1','\\\\\\*\\\\\\*会議メモ 1ページ目\\\\\\*\\\\\\*\n\n— 表示確認用ダミー追記 —\n・箇条書きA（表示/折返し確認）\n・箇条書きB（表示/折返し確認）\n\n\\\\\\\\| 項目 | 値 |\n\\\\\\\\| ---- | ---- |\n\\\\\\\\| A | 123 |\n\\\\\\\\| B | 456 |'),(3,3,1,'https://firebase/public/travel_page1.png','/admin/travel/page1','旅行計画 1ページ目\n\n— 表示確認用ダミー追記 —\n・箇条書きA（表示/折返し確認）\n・箇条書きB（表示/折返し確認）\n\n| 項目 | 値 |\n| ---- | ---- |\n| A    | 123  |\n| B    | 456  |'),(4,4,1,'https://firebase/public/budget_page1.png','/admin/budget/page1','家計簿 1ページ目\n\n— 表示確認用ダミー追記 —\n・箇条書きA（表示/折返し確認）\n・箇条書きB（表示/折返し確認）\n\n| 項目 | 値 |\n| ---- | ---- |\n| A    | 123  |\n| B    | 456  |'),(11,11,1,'https://firebase/public/ai_page1.png','/admin/ai/page1','AI研究 1ページ目\n\n— 表示確認用ダミー追記 —\n・箇条書きA（表示/折返し確認）\n・箇条書きB（表示/折返し確認）\n\n| 項目 | 値 |\n| ---- | ---- |\n| A    | 123  |\n| B    | 456  |'),(12,12,1,'https://firebase/public/data_page1.png','/admin/data/page1','データ分析 1ページ目\n\n— 表示確認用ダミー追記 —\n・箇条書きA（表示/折返し確認）\n・箇条書きB（表示/折返し確認）\n\n| 項目 | 値 |\n| ---- | ---- |\n| A    | 123  |\n| B    | 456  |'),(13,13,1,'https://firebase/public/shopping_page1.png','/admin/shopping/page1','買い物リスト 1ページ目\n\n— 表示確認用ダミー追記 —\n・箇条書きA（表示/折返し確認）\n・箇条書きB（表示/折返し確認）\n\n| 項目 | 値 |\n| ---- | ---- |\n| A    | 123  |\n| B    | 456  |'),(14,14,1,'https://firebase/public/diy_page1.png','/admin/diy/page1','DIY記録 1ページ目\n\n— 表示確認用ダミー追記 —\n・箇条書きA（表示/折返し確認）\n・箇条書きB（表示/折返し確認）\n\n| 項目 | 値 |\n| ---- | ---- |\n| A    | 123  |\n| B    | 456  |'),(15,15,1,'https://firebase/public/gym_page1.png','/admin/gym/page1','筋トレ 1ページ目\n\n— 表示確認用ダミー追記 —\n・箇条書きA（表示/折返し確認）\n・箇条書きB（表示/折返し確認）\n\n| 項目 | 値 |\n| ---- | ---- |\n| A    | 123  |\n| B    | 456  |'),(16,16,1,'https://firebase/public/meal_page1.png','/admin/meal/page1','食事記録 1ページ目\n\n— 表示確認用ダミー追記 —\n・箇条書きA（表示/折返し確認）\n・箇条書きB（表示/折返し確認）\n\n| 項目 | 値 |\n| ---- | ---- |\n| A    | 123  |\n| B    | 456  |'),(23,24,1,'https://firebasestorage.googleapis.com/v0/b/omega-strand-466903-n8.firebasestorage.app/o/images%2F575004f0-3052-4bac-9077-ba2cf720c455-page-1-8431617650118845148.png?alt=media','gs://omega-strand-466903-n8.firebasestorage.app/images/575004f0-3052-4bac-9077-ba2cf720c455-page-1-8431617650118845148.png','画面番号\n画面 ID\n画面名\nURL\nクラス名\nテンプレートファイル名\n画面概要\nユーザーアクション\n対応機能 ID\n備考・フロント処理\n1\nG01-1\nログイン画面\n/login\nAuthController\nlogin.html\nメール・パスワードでログイン\n2\nG01-2\nユーザー登録画面\n/register\nAuthController\nregister.html\n新規ユーザー登録画面\n3\nG01-3\nパスワードリセット画面\n/reset-password\nAuthController\nreset_password.html\nメールでパスワード再設定リンクを送信'),(24,25,1,'https://firebasestorage.googleapis.com/v0/b/omega-strand-466903-n8.firebasestorage.app/o/images%2Fa48078c1-0605-4368-bd3e-47f9b1199ce8-page-1-15411802589437738741.png?alt=media','gs://omega-strand-466903-n8.firebasestorage.app/images/a48078c1-0605-4368-bd3e-47f9b1199ce8-page-1-15411802589437738741.png','開発・運用時のガド\nJDK17への移行に伴う留意\nHITACHI\nInspire the Next\n4.9\n2024\\\\.\nSeptember\n\n— 表示確認用ダミー追記 —\n・箇条書きA（表示/折返し確認）\n・箇条書きB（表示/折返し確認）\n\n\\\\| 項目 | 値 |\n\\\\| ---- | ---- |\n\\\\| A | 123 |\n\\\\| B | 456 |'),(25,25,2,'https://firebasestorage.googleapis.com/v0/b/omega-strand-466903-n8.firebasestorage.app/o/images%2Fe58b6c2c-55ea-4ee4-b2b6-e421482d6704-page-2-4579840565383189388.png?alt=media','gs://omega-strand-466903-n8.firebasestorage.app/images/e58b6c2c-55ea-4ee4-b2b6-e421482d6704-page-2-4579840565383189388.png','はじめに\nuCosminexus Application Server を使用し,システムを設計・構築・運用する方が留意すべき点につい\nて説明します。本書は,開発・運用フェーズで使用するドキュメントとして, JavaTM Development Kit 11\nから JavaTM Development Kit 17 への移行に伴う留意点について記述しています。\n1.対象とする読者\n本書は,JavaTM Development Kit 17 を使用し,システムを設計・構築・運用する立場にある方を対象\nとしています。\n商標類\n・HITACHI は,(株)日立製作所の商標または登録商標です。\n・Oracle と Java は、 Oracle Corporation 及びその子会社,関連会社の米国及びその他の国における登録\n商標です。文中の社名、商品名等は各社の商標または登録商標である場合があります。\n・その他記載の会社名、製品名は、それぞれの会社の商標もしくは登録商標です。\n■英略語の表記\n本書では,英略語を次のように表記しています。\nJava\nJava EE\nJava SE\nJDK\n表記\n製品名\nJava™\nJava™ Plat orm, Enterprise Edition\nJavaTM Plat orm, Standard Edition\nJavaTM Development Kit\nJDK™M\n|発行元\n株式会社日立製作所 クラウドサービスプラットフォームビジネスユニット マネージド&プラッ\nトフォームサービス事業部\nAll Rights Reserved. Copyright (C) 2024, Hitachi, Ltd.'),(26,25,3,'https://firebasestorage.googleapis.com/v0/b/omega-strand-466903-n8.firebasestorage.app/o/images%2Fbc84066b-bbdf-4a9b-8955-50eed6677bd0-page-3-12771291122419340068.png?alt=media','gs://omega-strand-466903-n8.firebasestorage.app/images/bc84066b-bbdf-4a9b-8955-50eed6677bd0-page-3-12771291122419340068.png','1 JDK17への移行に伴う留意事項\n目次\n1\n1.1 JDK17 への移行に伴う GC についての留意事項\n.........2\n1.2 JDK17 への移行に伴うその他の留意事項\n.4\ni'),(27,25,4,'https://firebasestorage.googleapis.com/v0/b/omega-strand-466903-n8.firebasestorage.app/o/images%2F841db999-ca80-40d7-bcd3-caf69ece58bc-page-4-9152928563469889157.png?alt=media','gs://omega-strand-466903-n8.firebasestorage.app/images/841db999-ca80-40d7-bcd3-caf69ece58bc-page-4-9152928563469889157.png','1 JDK17への移行に伴う留意事\nJDK17 への移行に伴う留意事項を説明します。\n本章の構成\n1.1 JDK17 への移行に伴う GC についての留意事項\n1.2 JDK17 への移行に伴うその他の留意事項\n1'),(28,25,5,'https://firebasestorage.googleapis.com/v0/b/omega-strand-466903-n8.firebasestorage.app/o/images%2F714a6fa7-4b40-420a-8e64-f351b5aaca2d-page-5-1421620436560096661.png?alt=media','gs://omega-strand-466903-n8.firebasestorage.app/images/714a6fa7-4b40-420a-8e64-f351b5aaca2d-page-5-1421620436560096661.png','1.1 JDK17 への移行に伴うGCについての留意事項\n本節では,JDK11 から JDK17 に移行した際のGC についての留意事項を記載します。\n(1) ZGC の追加\nJDK17 以降ではGC (ガベージコレクタ) として, ZGC が選択できます。\nZGC はチューニングが簡単で,かつ停止時間が非常に短いスケーラブルな GC です。 そのため,低\nレイテンシが要求されるシステム,および大規模なメモリ環境のシステムに適しています。\n従来からサポートされている SerialGC・G1GC と ZGCの比較を以下の表に示します。\n#\nGC 方式\n特徴\n1\nSerialGC\n2\nG1GC\nGC 処理の全てをアプリケーションを停\n止させて行うため,アプリケーション実\n行中は GC 処理による CPU リソースの\n消費が起こりません。このため,アプリ\nケーションのスループットが他 GC より\nも高いです。一方で, GC によるアプリ\nケーションの停止時間は Java ヒープサ\nイズに比例して長くなります。\n推奨システム\n最悪レスポンス時間の要\nスループットの\n件がなく,\n方が重要なシステム。\nGC 処理の一部をアプリケーションの実| GCによる最悪レスポンス\n行と並行で行います。アプリケーション 時間の要件があり,スルー\nの実行中に GC 処理による CPU リソープットよりソフトリアル\nスの消費が起こります。このため,アプ|タイム性が重要なシステ\nリケーションのスループットは低くなり ム。\n3\nZGC\nます。 一方,上記の並行処理で取得した\n情報を利用することで, アプリケーショ\nンの停止時間をソフトリアルタイム制御\nできます。\n一部を除き, GC 処理をアプリケーショ\nンの実行と並行で行うためアプリケー\nションの停止時間が非常に短いです。 こ\nれは数テラバイトの非常に大きなヒープ\nを使用するようなシステムにおいても同\n様ですが,その反面スループットは低下\nします。\n低レイテンシが要求され\nるシステム。\n2'),(29,25,6,'https://firebasestorage.googleapis.com/v0/b/omega-strand-466903-n8.firebasestorage.app/o/images%2F562f6dca-236d-4387-aeef-ac7daeec4526-page-6-1778537394481986461.png?alt=media','gs://omega-strand-466903-n8.firebasestorage.app/images/562f6dca-236d-4387-aeef-ac7daeec4526-page-6-1778537394481986461.png','(2) デフォルト GC の変更\nJDK17 以降ではデフォルトで選択される GC が SerialGC から G1GC に変更されました。 ただし,\n論理プロセッサが2未満または物理メモリが 1792MB 未満の場合は自動で SerialGC が選択されます。\n(3) 明示管理ヒープ機能の非サポート化\nJDK17 以降では明示管理ヒープ機能は非サポートです。 明示管理ヒープ機能は SerialGC における\nGC 停止時間の長期化を防ぐために使用されました。JDK17 以降ではアプリケーションの要件に合わ\nせて G1GC または ZGC を使用することで GC 停止時間の長期化を防ぎます。\nJDK11 以前に明示管理ヒープ機能を使用していてJDK17へ移行する場合,以下に注意してください。\n明示管理ヒープ機能のJava VM オプションを指定している場合, プロセスの起動に失敗します。\nそのため,明示管理ヒープ機能の Java VM オプションはすべて削除してください。\n・明示管理ヒープ機能の API を使用している場合, アプリケーションの改修は必要ありません。明示\n管理ヒープ機能が無効の場合と同じ挙動となります。\n・明示管理ヒープ機能は, Java ヒープとは別の Explicit ヒープという独自の領域を使用しています。\nこれまで明示管理ヒープ機能を使用していた場合, Explicit ヒープに配置されていたオブジェクトは,\nすべてJava ヒープに配置されることになります。 そのため,これまで Explicit ヒープに設定してい\nたヒープサイズ (-XX:HitachiExplicit Heap MaxSize に指定した値)をJava ヒープに加算してくだ\nさい。G1GC,ZGC を使用する場合は,さらにそれぞれのGC で必要な Java ヒープサイズを加算し\nて使用してください。\n3'),(30,25,7,'https://firebasestorage.googleapis.com/v0/b/omega-strand-466903-n8.firebasestorage.app/o/images%2F9bc8dfe9-acfb-4056-a156-dd962a98646a-page-7-2573789853383785070.png?alt=media','gs://omega-strand-466903-n8.firebasestorage.app/images/9bc8dfe9-acfb-4056-a156-dd962a98646a-page-7-2573789853383785070.png','1.2 JDK17 への移行に伴うその他の留意事項\n本節では,JDK11 から JDK17 に移行した際のGC 以外の留意事項を記載します。\n(1)クラスファイルのバージョンについて\nJava SE 17 からクラスファイルのバージョンが 61 になりました。\nこれにより,クラスファイルフォーマット仕様に対し, Record/ PermittedSubclasses の Attribute\nが追加されています。\nクラスファイル変換等でクラスファイルを出力する場合、出力するクラスファイルのバージョンとク\nラスファイルのフォーマットが一致している必要があります。一致していない場合はクラスロード時\nに java.lang.Veri yError が発生するため,クラスファイルの読み込みや書き換え等を行っている,\nもしくは,そのようなツールを使用している場合は新仕様対応を行ってください。\nなお,クラスファイルのバージョンはバイナリエディタやjavap コマンドを使用してクラスファイル\n内の”major version\" から確認してください。\nまた, javac コマンドのクロスコンパイルオプション (source/target もしくは release) を用いることで\n指定したバージョンのクラスファイルを作成することもできます。詳細は(2) javac コマンドの\nsource/target/release オプションに指定できる値を確認してください。\n(2) javac コマンドの source/target/release オプションに指定できる値\njavac コマンドのクロスコンパイルオプション (source/target もしくは release) を用いることで指定し\nたバージョンのクラスファイルを作成できます。\nただし, その場合はクラスバージョンに対応する Java SE の機能までしか使用することはできませ\nん。\nJDK17 以降ではクロスコンパイルオプション (source/target もしくは release)に” 6\" を指定できな\nくなったため、 指定可能なバージョンは\"7\"以上\"17\"以下です。\n(3) sun.nio.cs.map システムプロパティの削除\nJDK17 以降では sun.nio.cs.map システムプロパティは削除されました。 そのため, JDK11 以前は以\n下の指定によりエンコーディング名 shi t_jis, csshi tjis,ms_kanji,x-sjis を Windows-31J (MS932)\nの別名として使用できましたが, JDK17 以降では使用できません。\nsun.nio.cs.map=Windows-31J/Shi t_JIS\nこの動作変更により, Shi t_JIS に含まれていない Windows-31J には含まれる日本語の特殊文字に\nついて文字化けが発生する可能性があります。 その場合には,アプリケーションの改修が必要です。\n4'),(31,25,8,'https://firebasestorage.googleapis.com/v0/b/omega-strand-466903-n8.firebasestorage.app/o/images%2F298c4747-d7ae-4d29-a399-87297a724ad8-page-8-16398063073753375139.png?alt=media','gs://omega-strand-466903-n8.firebasestorage.app/images/298c4747-d7ae-4d29-a399-87297a724ad8-page-8-16398063073753375139.png','(4) 内部 API へのアクセス制限厳格化\nJDK17 以降では内部 API でのアクセス制限がより厳格化されたため, 内部 API を使用する際には\n--add-opens オプションを指定する必要があります。これまでは-add-opens オプションの代替として\n-illegal-access オプションを指定することで警告やエラーを回避することが可能でしたが, JDK17\n以降では-illegal-access オプションは指定できなくなります。\n以下に-add-opens オプションの使用方法を記載します。\n--add-opens[使用する内部 API が含まれるモジュール]/[使用する内部 API が含まれるパッケージ]\n=[アクセス元のモジュール] (,[アクセス元のモジュール])*\n(5) その他\nその他の移行に関する留意事項については,以下の Web ページを参照してください。\nhttps://docs.oracle.com/en/java/javase/17/migrate/signi icant-changes-jdk-release.html#GUID-56\n1005C1-12BB-455C-AD41-00455CAD23A6\n5\n-以上-'),(62,50,1,'https://firebasestorage.googleapis.com/v0/b/omega-strand-466903-n8.firebasestorage.app/o/users%2F1%2Fcategories%2F4%2Fnotes%2F50%2Fpages%2F001.png?alt=media','gs://omega-strand-466903-n8.firebasestorage.app/users/1/categories/4/notes/50/pages/001.png','1. ロンド形式: 主部が他の部分を挟みながら繰り返される形式。\n   ソナタ形式: 提示部、展開部、再現部からなる楽曲形式。\n   カデンツァ: 協奏曲の独奏部で、ソリストが技巧を披露する部分。\n   シンコペーション: 拍の頭を外してリズムをずらすこと。\n   デモーニッシュ: 悪魔的、魔的な魅力を持つこと。\n   緩徐楽章: テンポの遅い楽章。\n   フォルテ (ff): 非常に強く演奏すること。\n   *ウィーン・フィル: ウィーン・フィルハーモニー管弦楽団の略称。\n   ウィーン宮廷歌劇場:<u> かつてのウィーン国立歌劇場の名称。</u>*\n2. *てすｔ*\n3.'),(63,50,2,'https://firebasestorage.googleapis.com/v0/b/omega-strand-466903-n8.firebasestorage.app/o/users%2F1%2Fcategories%2F4%2Fnotes%2F50%2Fpages%2F002.png?alt=media','gs://omega-strand-466903-n8.firebasestorage.app/users/1/categories/4/notes/50/pages/002.png','ツェムリンスキー: オーストリアの作曲家、指揮者。\nメンゲルベルク: オランダの指揮者。\n純粋器楽: 声楽を含まない、楽器のみで演奏される音楽。\n換骨堕胎: 古い形式を借りて新しい内容を盛り込むこと。\n葬送行進曲: 死者を送るための行進曲。\nトランペット・ソロ: トランペット単独での演奏。\nコラール: プロテスタント教会の合唱賛美歌。\nスケルツォ: 諧謔的で速いテンポの楽章。\nカノン: 同じ旋律を異なる時点から模倣するように演奏する形式。\nベル・アップ: 金管楽器のベルを上に向けて演奏する特殊奏法。\nアダージェット: 非常にゆっくりとした速度で演奏すること。\nフーガ: 複数の声部が同じ主題を模倣・反復する楽曲形式。'),(64,50,3,'https://firebasestorage.googleapis.com/v0/b/omega-strand-466903-n8.firebasestorage.app/o/users%2F1%2Fcategories%2F4%2Fnotes%2F50%2Fpages%2F003.png?alt=media','gs://omega-strand-466903-n8.firebasestorage.app/users/1/categories/4/notes/50/pages/003.png','猩紅熱 (しょうこうねつ): 溶連菌感染による急性感染症。\nジフテリア: ジフテリア菌による感染症。\n分離派 (セセッション): 19世紀末ウィーンで起こった芸術運動。\nアンダンテ: 歩くような速さで。\nスケルツォ: 諧謔的で速いテンポの楽章。\nハンマー: マーラー交響曲第6番で用いられる打楽器。\n示導リズム: 特定のテーマを暗示する特徴的なリズム。\n示導和音: 特定のテーマを暗示する特徴的な和音。\nチェレスタ: 鉄琴に鍵盤を付けたような音色の楽器。\nカウベル: アルプスの牛の首にかけるような鐘。'),(65,50,4,'https://firebasestorage.googleapis.com/v0/b/omega-strand-466903-n8.firebasestorage.app/o/users%2F1%2Fcategories%2F4%2Fnotes%2F50%2Fpages%2F004.png?alt=media','gs://omega-strand-466903-n8.firebasestorage.app/users/1/categories/4/notes/50/pages/004.png','タムタム (ドラ): 大きな銅鑼（どら）。\n昇天: 天に昇ること。\nルーテ: むち。\nピッコロ: フルートより1オクターブ高い音域の小型フルート。\nイングリッシュ・ホルン: オーボエ属の楽器。\nエス (E♭)・クラリネット: E♭調のクラリネット。\nバス・クラリネット: 低音域のクラリネット。\nコントラファゴット: ファゴットより1オクターブ低い音域の楽器。\nテューバ: 金管楽器の最低音域を受け持つ楽器。\nティンパニ: 大型の半球形太鼓。\nグロッケンシュピール: 鉄琴の一種。\nホルツクラッパー: 木を打ち合わせる打楽器。'),(66,51,1,'https://firebasestorage.googleapis.com/v0/b/omega-strand-466903-n8.firebasestorage.app/o/users%2F1%2Fcategories%2F1%2Fnotes%2F51%2Fpages%2F001.png?alt=media','gs://omega-strand-466903-n8.firebasestorage.app/users/1/categories/1/notes/51/pages/001.png','「MyNote」というプロジェクトの制作発表ドキュメントの表紙です。\n作成者名は「小澤 基良」です。'),(67,51,2,'https://firebasestorage.googleapis.com/v0/b/omega-strand-466903-n8.firebasestorage.app/o/users%2F1%2Fcategories%2F1%2Fnotes%2F51%2Fpages%2F002.png?alt=media','gs://omega-strand-466903-n8.firebasestorage.app/users/1/categories/1/notes/51/pages/002.png','MyNoteの開発に使用された技術が記載されています。\n\n* **フロントエンド**: React、TypeScript、Tailwind CSSが使用されています。\n* **バックエンド**: Java、Spring Boot、MyBatisが使用されています。\n* **データベース**: MySQL、FireStoreが使用されています。\n* **その他**: Google Gemini APIが活用されています。'),(68,51,3,'https://firebasestorage.googleapis.com/v0/b/omega-strand-466903-n8.firebasestorage.app/o/users%2F1%2Fcategories%2F1%2Fnotes%2F51%2Fpages%2F003.png?alt=media','gs://omega-strand-466903-n8.firebasestorage.app/users/1/categories/1/notes/51/pages/003.png','MyNoteの主な工夫点に関する解説です。\n- **状態管理**: JotaiのAtomを使用し、ナビゲーションの状態を即時反映させ、コンポーネント間の状態共有をシンプルにしています。\n- **データ検証**: 新規登録時にデータベースで重複チェックを行い、ユーザー体験の向上とデータ整合性の確保を目指しています。\n- **エディタ**: MDXEditorを導入し、マークダウン編集と自動保存機能を提供することで、効率的な文書作成・編集を可能にしています。'),(69,51,4,'https://firebasestorage.googleapis.com/v0/b/omega-strand-466903-n8.firebasestorage.app/o/users%2F1%2Fcategories%2F1%2Fnotes%2F51%2Fpages%2F004.png?alt=media','gs://omega-strand-466903-n8.firebasestorage.app/users/1/categories/1/notes/51/pages/004.png','現在未実装の機能に関する概要です。\n- **管理者用ページ**: 専用の権限と管理機能を持つページを想定しています。\n- **キャッシュ管理**: TanStack Query (Tany) によるキャッシュ管理を導入し、高速化を図る予定です。\n- **カテゴリ順番/ソート機能**: カテゴリの整理と使いやすさの向上を目的としています。\n- **進行状況表示の改善**: 進捗度をパーセンテージで示すなど、使いやすさを改善する予定です。\n- **ChatGPT風の折りたたみメニュー**: UIの改善を目的としたメニュー機能です。\n- **編集処理のトースト表示**: 編集操作の結果をユーザーに分かりやすく伝えるための表示です。'),(70,51,5,'https://firebasestorage.googleapis.com/v0/b/omega-strand-466903-n8.firebasestorage.app/o/users%2F1%2Fcategories%2F1%2Fnotes%2F51%2Fpages%2F005.png?alt=media','gs://omega-strand-466903-n8.firebasestorage.app/users/1/categories/1/notes/51/pages/005.png','フロントエンドにおける今後の制作予定が示されています。\n- **デザイン**: ユーザビリティとアクセシビリティの向上を目指し、UIを再定義します。\n- **アニメーション**: open/closeアニメーションの実装により、スムーズな画面遷移とインタラクションを提供します。\n- **コンポーネント**: 共通UIのCSSコンポーネント化を進め、再利用性と保守性を高めます。\n- **テーマ**: カラーモードの実装を通じて、ダークモード対応と視認性の確保を目指します。\n- **レスポンシブ対応**: CSSのレスポンシブ化により、様々なデバイスでの表示に対応します。'),(71,51,6,'https://firebasestorage.googleapis.com/v0/b/omega-strand-466903-n8.firebasestorage.app/o/users%2F1%2Fcategories%2F1%2Fnotes%2F51%2Fpages%2F006.png?alt=media','gs://omega-strand-466903-n8.firebasestorage.app/users/1/categories/1/notes/51/pages/006.png','システムをREST化する上での再設計項目です。\n- **要件定義書**: システム全体の要件をREST設計に適合するよう再定義します。\n- **基本設計書**: APIエンドポイントとリソース構造を設計します。\n- **詳細設計書**: 各APIエンドポイントの実装詳細とデータフローを記述します。\n- **API仕様書**: OpenAPI形式でAPIエンドポイントの仕様書を作成します。\n- **テスト詳細書**: 単体テストと結合テストの計画、および自動化テストの設計を行います。');
/*!40000 ALTER TABLE `note_pages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notes`
--

DROP TABLE IF EXISTS `notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `category_id` int NOT NULL,
  `user_seq_no` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `original_filename` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_notes_user_seq` (`user_id`,`user_seq_no`),
  KEY `fk_notes_user` (`user_id`),
  KEY `fk_notes_category` (`category_id`),
  CONSTRAINT `fk_notes_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notes`
--

LOCK TABLES `notes` WRITE;
/*!40000 ALTER TABLE `notes` DISABLE KEYS */;
INSERT INTO `notes` VALUES (1,1,1,1,'業務マニュアル','会社用の業務手順書','manual.pdf','2025-08-21 11:12:29','2025-08-21 11:12:29'),(2,1,1,2,'会議メモ','定例会議の議事録','meeting.pdf','2025-08-21 11:12:29','2025-08-21 11:12:29'),(3,1,2,3,'旅行計画','夏休みの旅行プラン','travel.pdf','2025-08-21 11:12:29','2025-08-21 11:12:29'),(4,1,2,4,'家計簿','今月の支出まとめ','budget.pdf','2025-08-21 11:12:29','2025-08-21 11:12:29'),(11,2,6,1,'論文メモ','AI研究のまとめ','ai.pdf','2025-08-21 11:12:29','2025-08-21 11:12:29'),(12,2,6,2,'データ分析','Pythonによる解析','data.pdf','2025-08-21 11:12:29','2025-08-21 11:12:29'),(13,2,7,3,'買い物リスト','スーパーのリスト','shopping.pdf','2025-08-21 11:12:29','2025-08-21 11:12:29'),(14,2,7,4,'DIY記録','家具修理の記録','diy.pdf','2025-08-21 11:12:29','2025-08-21 11:12:29'),(15,2,8,5,'筋トレメモ','ジムでのトレーニング記録','gym.pdf','2025-08-21 11:12:29','2025-08-21 11:12:29'),(16,2,8,6,'食事記録','健康管理用の食事メモ','meal.pdf','2025-08-21 11:12:29','2025-08-21 11:12:29'),(24,1,4,16,'画面設計 - 画面一覧 (1)','<h2>画面定義書</h2>\n<p>このドキュメントは、Webアプリケーションの画面定義書です。ログイン、ユーザー登録、パスワードリセット、管理者用・ユーザー用共通ヘッダー、ユーザー管理、お問い合わせ管理、PDFアップロード、ノート管理、設定、お問い合わせフォームなど、様々な画面の詳細が記載されています。</p>','画面設計 - 画面一覧 (1).pdf','2025-08-26 11:56:39','2025-08-26 11:56:54'),(25,1,2,17,'wp_dev_ope_jdk17_11_40','<h2>JDK17移行に伴う留意点</h2>\n<p>このドキュメントは、uCosminexus Application Serverを使用するシステムにおいて、Java Development Kit (JDK) 11からJDK 17への移行時に留意すべき事項をまとめたものです。特に、ガベージコレクション(GC)の変更点、クラスファイルのバージョン、javacコマンドのオプション、内部APIへのアクセス制限の厳格化などが含まれています。</p>','wp_dev_ope_jdk17_11_40.pdf','2025-08-26 13:13:20','2025-08-26 13:13:48'),(28,1,6,20,'My new note','updated by Postman',NULL,'2025-10-07 10:54:01','2025-10-07 12:02:47'),(29,1,6,21,'My new note','hello',NULL,'2025-10-07 11:01:17','2025-10-07 11:01:17'),(30,1,6,22,'My new note','hello','test.pdf','2025-10-07 11:03:01','2025-10-07 11:03:01'),(31,1,6,23,'My new note','hello','test.pdf','2025-10-07 11:03:10','2025-10-07 11:03:10'),(50,1,4,24,'楽曲解説','このドキュメントは、著名な楽曲解説者である野本由紀夫氏によるモーツァルトとマーラーの作品解説です。\n\nモーツァルトのピアノ協奏曲第20番は、彼にとって珍しい短調の作品であり、ロマン主義への入り口を示す情熱的な表現が特徴として深く掘り下げられています。\n\nマーラーの交響曲第5番では、彼の人生の転機や妻アルマとの出会いが作曲背景に与えた影響、特に感動的な第4楽章「アダージェット」の誕生秘話が情感豊かに語られています。\n\nそして交響曲第6番「悲劇的」では、作曲家が幸福の絶頂期にあったにもかかわらず、なぜ悲劇的な結末を迎える作品となったのか、その背景にある「示導リズム」や「ハンマー」といった音楽的要素が詳細に分析されています。\n\n各作品の構造、テーマ、そしてそれにまつわる逸話が、聴衆の心に深く響くように解説された一冊です。','20150215-25-26.pdf','2025-11-03 19:45:46','2025-11-03 19:46:40'),(51,1,1,25,'MyNote-制作発表','このドキュメントは「MyNote」というプロジェクトの制作発表資料です。\nフロントエンド、バックエンド、データベース、その他の使用技術が紹介されています。\n状態管理、データ検証、エディタに関する工夫点が具体的に説明されています。\n管理者ページ、キャッシュ管理、カテゴリソート機能など、未実装の機能についても記載されています。\nフロントエンドの今後の制作予定として、デザイン、アニメーション、コンポーネント化、テーマ、レスポンシブ対応が挙げられています。\nシステムのREST化に伴う再設計項目として、要件定義書からテスト詳細書までの各工程での変更点が示されています。','MyNote-制作発表.pdf','2025-11-04 10:41:45','2025-11-04 10:42:43');
/*!40000 ALTER TABLE `notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token_hash` char(64) NOT NULL,
  `issued_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `request_ip` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_token_hash` (`token_hash`),
  KEY `idx_user_active` (`user_id`,`expires_at`,`used_at`),
  CONSTRAINT `fk_prt_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_passwords`
--

DROP TABLE IF EXISTS `user_passwords`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_passwords` (
  `user_id` int NOT NULL,
  `password_hash` varchar(60) NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_user_passwords_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_passwords`
--

LOCK TABLES `user_passwords` WRITE;
/*!40000 ALTER TABLE `user_passwords` DISABLE KEYS */;
INSERT INTO `user_passwords` VALUES (1,'$2a$10$mgbsPyzGbLaUmEVHRjUXLeC.V.6cQzVLqwcLdA2lqAlPYwN30yTia','2025-10-07 10:42:32'),(2,'$2a$10$8B/r6.eeRKP8QuHGI4oihO1e9/SbS4IfRByEF3gF1PuLakjCN6fZW','2025-10-07 10:42:32'),(3,'$2a$10$3jweG..EiV6H3zGsXusTOOCPQOeS33iDwKi04O8fMBSjW33Y9LuhG','2025-10-07 10:42:32'),(6,'$2a$10$abcdefghijklmnopqrstuvwxysabcdefghijklmno12','2025-10-07 10:42:32'),(7,'$2a$10$1234567890abcdefghijklmnopqrstuvwxysabcd','2025-10-07 10:42:32'),(8,'$2a$10$adminpasswordhashsampleabcdefghijklmn','2025-10-07 10:42:32');
/*!40000 ALTER TABLE `user_passwords` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_name` varchar(60) NOT NULL,
  `email` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'user',
  PRIMARY KEY (`id`),
  UNIQUE KEY `login_id` (`user_name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'user1','user1@example.com','2025-08-21 11:12:29','USER'),(2,'user2','user2@example.com','2025-08-21 11:12:29','USER'),(3,'admin1','admin@example.com','2025-08-21 11:12:29','ADMIN'),(6,'user_1759801171','user_1759801171@example.com','2025-10-07 10:39:32','USER'),(7,'user_1759801175','user_1759801175@example.com','2025-10-07 10:39:35','USER'),(8,'user_1759801183','user_1759801183@example.com','2025-10-07 10:39:43','USER');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_settings`
--

DROP TABLE IF EXISTS `user_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_settings` (
  `user_id` int NOT NULL,
  `theme` varchar(20) NOT NULL DEFAULT 'system',
  `custom_bg_color` varchar(20) DEFAULT NULL,
  `custom_border_color` varchar(20) DEFAULT NULL,
  `custom_font_color` varchar(20) DEFAULT NULL,
  `custom_input_bg_color` varchar(20) DEFAULT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_user_settings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_settings`
--

LOCK TABLES `user_settings` WRITE;
/*!40000 ALTER TABLE `user_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_settings` ENABLE KEYS */;
UNLOCK TABLES;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-06 22:01:54
