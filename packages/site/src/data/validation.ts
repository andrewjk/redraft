//// TODO: validation for the schema here
//import * as v from "valibot";
//
//
//export const User = v.object({
//	id: v.number(),
//	email: v.pipe(v.string(), v.email()),
//	username: v.pipe(v.string()),
//	password: v.pipe(v.string()),
//	name: v.pipe(v.string()),
//	bio: v.pipe(v.string()),
//	image: v.pipe(v.string()),
//	created_at: v.pipe(v.date()),
//	updated_at: v.pipe(v.date()),
//	deleted_at: v.pipe(v.date()),
//});
//
///*
//// The people being followed, who we will receive posts etc from
//export const Following = v.object({
//	id: v.number(),
//    username: text().notNull(),
//    url: text().notNull(),
//    // The secret shared key that we use to communicate with this user
//    shared_key: text().notNull(),
//    name: text().notNull(),
//    image: text().notNull(),
//    created_at: int().notNull(),
//    updated_at: int().notNull(),
//    deleted_at: int().notNull(),
//});
//
//// The people following us, who we will send posts etc to
//export const FollowedBy = v.object({
//	id: v.number(),
//    // Whether they've been approved to follow -- everyone starts off by sending us a request
//    approved: int({ mode: "boolean" }).notNull(),
//    username: text().notNull(),
//    url: text().notNull(),
//    // The secret shared key that we use to communicate with this user
//    shared_key: text().notNull(),
//    name: text().notNull(),
//    image: text().notNull(),
//    created_at: int().notNull(),
//    updated_at: int().notNull(),
//    deleted_at: int().notNull(),
//});
//*/
//// Our posts
//export const Post = v.object({
//	id: v.number(),
//	text: text().notNull(),
//	created_at: int().notNull(),
//	updated_at: int().notNull(),
//	deleted_at: int().notNull(),
//});
//
//// Posts from people we are following
//export const Feed = v.object({
//	id: v.number(),
//	text: text().notNull(),
//	user_id: int().notNull(),
//	liked: int({ mode: "boolean" }).notNull(),
//	created_at: int().notNull(),
//	updated_at: int().notNull(),
//	deleted_at: int().notNull(),
//});
