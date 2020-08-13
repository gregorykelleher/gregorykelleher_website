---
title: Blog
blog_url: blog
menu: Blog

sitemap:
    changefreq: monthly
    priority: 1.03

content:
    items: @self.children
    order:
        by: date
        dir: desc
    limit: 7
    pagination: true

feed:
    description: Sample Blog Description
    limit: 10

pagination: true
---

