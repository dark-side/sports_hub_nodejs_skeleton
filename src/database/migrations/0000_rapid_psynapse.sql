CREATE TABLE "articles" (
	"id" bigint AUTO_INCREMENT NOT NULL,
	"title" varchar(255),
	"short_description" varchar(255),
	"description" text,
	"created_at" timestamp NOT NULL DEFAULT (now()),
	"updated_at" timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT "articles_id" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" bigint AUTO_INCREMENT NOT NULL,
	"content" text,
	"article_id" bigint NOT NULL,
	"created_at" timestamp NOT NULL DEFAULT (now()),
	"updated_at" timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT "comments_id" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE "jwt_denylists" (
	"id" bigint AUTO_INCREMENT NOT NULL,
	"jti" varchar(255) NOT NULL,
	"exp" timestamp NOT NULL,
	"created_at" timestamp NOT NULL DEFAULT (now()),
	"updated_at" timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT "jwt_denylists_id" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE "likes" (
	"id" bigint AUTO_INCREMENT NOT NULL,
	"likes" int,
	"dislikes" int,
	"likeable_type" varchar(255) NOT NULL,
	"likeable_id" bigint NOT NULL,
	"created_at" timestamp NOT NULL DEFAULT (now()),
	"updated_at" timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT "likes_id" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigint AUTO_INCREMENT NOT NULL,
	"email" varchar(255) NOT NULL,
	"encrypted_password" varchar(255) NOT NULL,
	"reset_password_token" varchar(255),
	"reset_password_sent_at" timestamp,
	"remember_created_at" timestamp,
	"created_at" timestamp NOT NULL DEFAULT (now()),
	"updated_at" timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT "users_id" PRIMARY KEY("id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
