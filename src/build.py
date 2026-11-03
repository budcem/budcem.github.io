# src/app.html-dən saytın index.html faylını yaradır: python3 src/build.py
import pathlib
src = pathlib.Path(__file__).parent
body = (src / "app.html").read_text(encoding="utf-8")
head = """<!doctype html>
<html lang="az">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Büdcəm">
<meta name="theme-color" content="#f3f5f4" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0d1412" media="(prefers-color-scheme: dark)">
<link rel="manifest" href="manifest.json">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:0}body{margin:0}[hidden]{display:none!important}</style>
</head>
<body>
"""
(src.parent / "index.html").write_text(head + body + "\n</body>\n</html>\n", encoding="utf-8")
