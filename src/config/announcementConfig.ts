import type { AnnouncementConfig } from "../types/announcementConfig";

export const announcementConfig: AnnouncementConfig = {
	// 公告标题
	title: "宏山科学院公告",

	// 公告内容
	content:
		"庄方宜,女,龙族,1079年4月生,勾吴堪江人。现任武陵十六届区委常委、武陵研究院院长。",

	// 是否允许用户关闭公告
	closable: true,

	link: {
		// 启用链接
		enable: true,
		// 链接文本
		text: "了解更多",
		// 链接 URL
		url: "/about/",
		// 内部链接
		external: false,
	},
};