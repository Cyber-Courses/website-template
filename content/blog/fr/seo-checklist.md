---
title: "Une checklist SEO pour les sites de contenu"
description: "Une checklist pragmatique et priorisée pour les sites de contenu qui veulent gagner du trafic organique en 2026."
date: "2026-04-15"
author: "Your Name"
tags: ["seo", "checklist", "guide"]
image: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=1600&q=80"
---

La barre du « bon SEO » continue de monter. Voici la liste courte — les choses qui font systématiquement bouger les classements pour un site de contenu en 2026.

## Fondamentaux

- **Une seule URL canonique par page.** Les canoniques mélangées sont la première raison pour laquelle des pages se désindexent.
- **Titre et description ne sont pas optionnels.** Écrivez-les pour les humains d'abord ; les moteurs suivront.
- **Définissez `lang` correctement.** L'attribut `lang` est lu par les outils d'accessibilité *et* par les moteurs de recherche.

## Crawlabilité

- **Sitemap avec hreflang.** Les alternates par page battent les déclarations uniquement dans le sitemap, parce qu'elles survivent à la syndication.
- **robots.txt** qui ne bloque pas le JS/CSS. Google a besoin de rendre la page.
- **Maillage interne.** Trois clics depuis la page d'accueil vers n'importe quelle page, c'est la règle.

## Expérience

- **CLS = 0.** Le shift de layout se corrige : donnez des dimensions aux images, réservez l'espace des embeds, et n'inversez pas le thème sans peinture.
- **LCP < 2,5 s.** Le plus gros paint, c'est généralement l'image hero. Optimisez *celle-là*, pas toutes.
- **INP < 200 ms.** Allégez le JS client — la plupart des sites le peuvent.

## Données structurées

Un seul `@graph` contenant `Organization`, `BlogPosting` et `BreadcrumbList` couvre la majorité des blogs. N'ajoutez `FAQPage` que si le contenu est *vraiment* une FAQ — Google pénalise les divergences.

Voilà la liste courte. Le reste, c'est de l'itération.
