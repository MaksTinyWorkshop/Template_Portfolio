-- Date: 2026-02-07T14:10:13.566Z
-- IMPORTANT: Exécuter ce script depuis le conteneur Docker

BEGIN;

-- Nettoyage des tables (ordre inverse des foreign keys)
TRUNCATE TABLE "AvailabilityLog", "ArticlePerson", "ProjectPerson", "ArticleTag", "ProjectTag", "ProjectImage", "Article", "Project", "Media", "Person", "Tag" RESTART IDENTITY CASCADE;

-- Insertion des médias
INSERT INTO "Media" (id, url, kind, "createdAt", "updatedAt") VALUES
('0f54dee9-05cf-92f9-cd97-309e1021040f', '/images/avatars/avatar_max.jpg', 'image', NOW(), NOW()),
('82a73b17-57bc-41cc-213b-cc142a5ce00e', '/images/articles/linkedin/devs_1.jpeg', 'image', NOW(), NOW()),
('050aae8f-1bfd-83b8-d602-71c6d69561de', '/images/articles/linkedin/devs_2.jpeg', 'image', NOW(), NOW()),
('8ef2305b-1662-5451-5bf6-6c9732326756', '/images/articles/linkedin/devs_3.jpeg', 'image', NOW(), NOW()),
('7db0dbe9-cf21-bb4a-014c-8f7ab0e0836f', '/images/projects/agence-communication/featured.avif', 'image', NOW(), NOW()),
('919ee17e-6253-5bb3-f998-8c31b10a13dc', '/images/projects/agence-communication/cover-1.avif', 'image', NOW(), NOW()),
('38c04e17-9f17-613a-b2cf-993cb2fe058a', '/images/projects/agence-communication/cover-2.avif', 'image', NOW(), NOW()),
('5e5fe220-cd26-df3c-4ba1-8d9245771f6f', '/images/projects/agence-communication/cover-3.avif', 'image', NOW(), NOW()),
('2a27ffd1-7b2a-d4d1-ad6f-2a09a53ec68f', '/images/projects/agence-communication/cover-4.avif', 'image', NOW(), NOW()),
('bfeea951-3d07-ac46-e0b7-571b63263619', '/images/projects/artisan-velux/featured.avif', 'image', NOW(), NOW()),
('4613f3dd-29dc-fb75-ab5e-af1315d8dd28', '/images/projects/artisan-velux/cover-1.avif', 'image', NOW(), NOW()),
('ca717a1e-d011-9f10-25a8-398d22f194bd', '/images/projects/artisan-velux/cover-2.avif', 'image', NOW(), NOW()),
('9ccd154d-fd7e-5fe1-ec92-ca706e515fc8', '/images/projects/artisan-velux/cover-3.avif', 'image', NOW(), NOW()),
('5b991169-a831-22eb-9842-28596884cd34', '/images/projects/artisan-velux/cover-4.avif', 'image', NOW(), NOW()),
('b37c29f1-a876-c685-f2b7-e8900bffeda1', '/images/projects/endo-sens/cover-1.avif', 'image', NOW(), NOW()),
('6e9712be-8bea-118b-3f90-ed4c409097ba', '/images/projects/endo-sens/cover-2.avif', 'image', NOW(), NOW()),
('e72fd49e-2041-912b-e222-e3002ef97557', '/images/projects/juriscope/cover-1.avif', 'image', NOW(), NOW()),
('ee83d8e0-6c5d-373f-3bdf-6302c03e5660', '/images/projects/juriscope/cover-2.avif', 'image', NOW(), NOW()),
('6b5b149e-d43f-8de6-8d0e-d90e2ef56d65', '/images/projects/juriscope/cover-3.avif', 'image', NOW(), NOW()),
('f0c7885d-d8ad-c20f-51cc-c45e23f2037c', '/images/projects/khimaira/cover-1.avif', 'image', NOW(), NOW()),
('9b88ee55-b25f-e50e-ec33-75e2e54f32cc', '/images/projects/khimaira/cover-2.avif', 'image', NOW(), NOW()),
('92ed362c-426b-7649-dcba-2455159d2b36', '/images/projects/khimaira/cover-3.avif', 'image', NOW(), NOW()),
('239efec3-af53-d471-42f2-9fbdbf0a9154', '/images/projects/khimaira/cover-4.avif', 'image', NOW(), NOW()),
('ef0ea003-e8cb-b20e-1e21-75b8c24cd01a', '/images/projects/khimaira/cover-5.avif', 'image', NOW(), NOW()),
('509b5904-1f36-bdd4-4040-7fcb2ed7512c', '/images/projects/portfolio_old/cover-1.avif', 'image', NOW(), NOW()),
('64b7e0d5-712e-a2ce-34b0-8ce5c1cf0868', '/images/projects/portfolio_old/cover-2.avif', 'image', NOW(), NOW()),
('5ff0be7a-ddb2-5102-ab28-b10d6573c920', '/images/projects/portfolio_old/cover-3.avif', 'image', NOW(), NOW()),
('41b9112d-cd06-a055-ee5a-9e96b7d63d9a', '/images/projects/webapp-maconnique/cover-1.avif', 'image', NOW(), NOW()),
('52f2ff8d-4da4-40b0-8f2d-2110dfb4c9be', '/images/projects/portfolio_new/featured.avif', 'image', NOW(), NOW()),
('8c7d7fcc-dc57-4b7a-9bd4-6a5b6d4b4ec3', '/images/projects/portfolio_new/cover-1.avif', 'image', NOW(), NOW()),
('c2b93f7f-8764-4dc1-ae2f-1af0de2ff621', '/images/projects/portfolio_new/cover-2.avif', 'image', NOW(), NOW()),
('d7ab12c6-8e6b-4c2f-8c89-936f7c34b02', '/images/projects/portfolio_new/cover-3.avif', 'image', NOW(), NOW());

-- Insertion de la personne principale
INSERT INTO "Person" (id, "firstName", "lastName", pseudo, "fullName", email, role, bio, "profileData", "siteOwner", "avatarPath", "avatarMediaId", "createdAt", "updatedAt") VALUES
('62cded6b-b881-d682-d8be-815775b7b164', 'YOUR_FIRST_NAME', 'YOUR_LAST_NAME', 'Dinodev', 'YOUR_FIRST_NAME YOUR_LAST_NAME', 'your.email@example.com', 'Développeur Full Stack', 'Développeur full stack freelance, spécialisé dans les sites vitrines et les solutions métier durables.', '{"contacts":{"email":"mailto:your.email@example.com","whatsapp":"https://wa.me/33648652868","linkedin":"https://www.linkedin.com/in/maxfleury-dinodev/","github":"https://github.com/MaksTinyWorkshop","malt":"https://www.malt.fr/profile/maximefleury1","calendar":"https://calendly.com/contact-dinodev"},"metadata":{"location":"Europe/Paris","languages":["Français","English","Español"]}}', true, '/images/avatars/avatar_max.jpg', '0f54dee9-05cf-92f9-cd97-309e1021040f', NOW(), NOW());

-- Mise à jour des médias avec l'uploader
UPDATE "Media" SET "uploadedById" = '62cded6b-b881-d682-d8be-815775b7b164';

-- Insertion des tags
INSERT INTO "Tag" (id, slug, name, category, "createdAt", "updatedAt") VALUES
('63e3cd64-45f0-7193-affd-53a9102e1ef6', 'reflexions', 'Reflexions', 'article', NOW(), NOW()),
('be94ba0c-4aa8-164f-fbec-d18f6dc96dcc', 'opinion-tech', 'Opinion, Tech', 'article', NOW(), NOW()),
('e51e1bcd-fce4-0087-73e1-771f2b9caba0', 'tutorial-tech-dev', 'Tutorial, Tech, Dev', 'article', NOW(), NOW()),
('a775e468-65b3-9037-fa59-7184232d4f25', 'web', 'Web', 'project', NOW(), NOW()),
('b845869b-2d26-cbde-51d8-ad52acd4e0eb', 'vitrine', 'Vitrine', 'project', NOW(), NOW()),
('d5136f80-be8c-ebea-b639-bd9860bf2e45', 'saas', 'SaaS', 'project', NOW(), NOW()),
('1f2194b3-ce5c-0aa5-2b13-52ebb1f1156d', 'metier', 'Métier', 'project', NOW(), NOW()),
('5c89d3e9-8a7d-4f86-8b66-1b0ef490f3cf', 'documentation', 'Documentation', 'project', NOW(), NOW());

-- Insertion des autres personnes
INSERT INTO "Person" (id, "fullName", "createdAt", "updatedAt") VALUES
('6bd9d1ea-279e-3ae9-2294-177c7469bd30', 'Max', NOW(), NOW()),
('406eeaf3-15e9-d7a6-9f5c-47c96d35b2c8', 'Henri D', NOW(), NOW());

-- Insertion des articles
INSERT INTO "Article" (id, slug, title, summary, content, status, "publishAt", featured, "mediaId", "createdAt", "updatedAt") VALUES
('5dc9a3f6-3d5c-28fc-d0fd-93a6d358a9e0', 'devs-1', 'On ne manque pas de développeurs. On manque d’entreprises prêtes à en former', 'La tech ne manque pas de développeurs : elle manque d’entreprises disposées à former des juniors. Pendant que les processus de recrutement s’étirent, que les CV IA circulent en boucle et que les annonces périmées restent en ligne, les équipes tournent à flux tendu. L’IA accélère le travail, mais ne remplacera jamais la transmission, qui seule permet de créer des seniors. Et à force d’attendre un “profil parfait”, le secteur devient autophage', '
## 🍽️ De la restauration à la tech : le choc culturel

Avant l’IT, j’ai dirigé plusieurs restaurants, et j’y ai appris un truc très simple :

Une équipe ne s’effondre pas d’un coup. Elle s’abîme quand on refuse de la renforcer.
C’était vrai en restauration, je découvre que c’est tout aussi vrai dans la tech.

Quand je me suis reconverti, j’ai fait ma part :

- 📚 j’ai appris,
- 💻 j’ai codé,
- 🧠 j’ai compris.

Puis j’ai rencontré le recrutement tech... Et là j’ai compris que, tel Alice (ou Néo selon les refs), j''ai suivi le lapin blanc

---

## 🎪 Le cirque absurde du recrutement tech

**« On manque de développeurs ! »** … mais on refuse les juniors.

**« On veut un profil opérationnel J+1 ! »** … mais l’annonce date de 4 mois.

**« On n’a pas le temps d’onboarder ! »** … mais l’équipe se noie depuis autant de temps au moins.

La contradiction est flagrante.

Et puis le rituel habituel :

T''envoies un CV à une ESN lambda
Tu reçois un message automatique, qui te dit qu''on te recontactera sous deux semaines, même si réponse négative oui oui, parce que "chez nous, chaque candidat compte"

Si tu passes ce premier filtre :

- Visio avec RH sous 2 semaines
- Test technique de 4 heures une semaine plus tard
- Entretien N+1
- Entretien N+2
- Débrief
- Décision sous 20 jours ouvrés

Avec en option :

- 🩺 un bilan sanguin
- 🧠 un test psychomoteur
- 🚗 le carnet de révision de ta voiture....

Comme si t''allais bosser pour Le bureau des légendes ! Mais bon sang, "période d''essai", ça n''évoque rien pour personne ??

---

## 🤡 Le paradoxe moderne : IA → CV → IA → ESN → IA

Aujourd’hui, beaucoup de candidats envoient des CV… qu’ils n’ont même plus écrits avec leurs petites mains
Ils sont générés par IA -> pour plaire à des IA -> qui les filtrent pour des ESN -> qui lisent ces CVIA -> pour des annonces parfois obsolètes...
Evidemment, dans cet intervalle, l''équipe tourne avec au moins une personne manquante : c’est un peu comme éteindre un incendie avec un verre d’eau. Ça tient… jusqu’au moment où ça ne tient plus.

**Bienvenue dans la boucle de l’absurde.**

🦈 Et pendant ce temps-là : des requins surfent la vague -> En parallèle sur les réseaux pullulent des offres de tous poils, miraculeuses :

Abonnements miraculeux : « Plus d’entretiens à 29€/mois ! »

Automatisation agressive : « 500 CV envoyés par jour, optimisés IA ! »

Promesses à la DARTY : « Garantie réussite ! »

Au final :

- les ATS saturent,
- les juniors s’épuisent,
- les recruteurs croulent sous les clones,
- et rien n’avance vraiment.

Un business qui profite surtout… à ceux qui ont créé le problème. Payer pour trouver du travail : on marche vraiment sur la tête.

---

## 👨💻 Parlons enfin des juniors (les vrais)

Contrairement aux clichés, un junior sait coder.
Ce qui lui manque ? Le contexte. Pas la compétence.

Comme en restauration : un serveur expérimenté qui change d’établissement sait bosser, il ne sait juste pas encore dans quel frigo sont rangés les desserts et le ketchup pour la 12 ! Et ça, ça s’apprend... vite. Plus vite que n’importe quel process de recrutement XXL en tout cas.

---

## 🤖 Ce que l’IA fait vraiment (et ce qu’elle ne fera jamais)

Je n’ai pas peur de l’IA.
Je l’utilise tous les jours, et je progresse chaque jour grâce à elle... J’ai testé GPT, Claude, Copilot, Cursor, Windsurf, Replit… Et soyons lucides : ça change profondément la manière de travailler.

C''est dingue ce qu''elle sait faire :

- générer un squelette de front en 3 minutes,
- résoudre en 20 secondes un bug que je traînais depuis 2 jours,
- expliquer un concept mieux que la doc officielle,
- proposer un refactoring propre, argumenté et cohérent, ...

Oui, certaines choses que j’ai apprises sont déjà en partie obsolètes. Pas parce qu’elles ne servent plus, mais parce que l’IA permet d’aller plus vite dessus.
Mais soyons clairs : Une IA accélère, elle n’assume pas un poste.

Elle ne comprend pas :

- le métier,
- les priorités,
- les compromis,
- la culture d’équipe,
- la communication humaine,
- les enjeux non écrits.

Alors j’ai posé la question directement à un LLM (chat GPT 5.2) : “Une IA peut-elle remplacer un junior en entreprise ?”

Voici sa réponse :

> « Non. Une IA peut produire du code, expliquer des concepts, résoudre des bugs simples et accélérer certaines tâches. Mais elle ne comprend ni le métier, ni les priorités, ni le contexte humain dans lequel s’inscrit un projet. > Un junior, lui, apprend ces éléments, s’adapte, pose les bonnes questions, comprend les contraintes réelles et finit par contribuer au produit, pas seulement au code. L’IA exécute sans responsabilité. Un junior évolue, devient > autonome et finit par apporter une valeur qu’aucun modèle ne peut remplacer. En réalité, l’IA peut augmenter un junior… mais sûrement pas le remplacer. »

Il m''a pondu un résultat beaucoup plus long évidemment, que je lui ai demandé de résumer (malin le gars)...

Au final, l’IA peut t’aider à apprendre plus vite. Mais elle ne remplacera jamais ce que seule une équipe peut transmettre.
**Et tout est dit.**

---

## 🧩 Former un junior, c’est renforcer une équipe

Ça oblige à :

- clarifier
- documenter
- structurer

Bref, à rendre l’équipe plus solide, plus résiliente, et surtout, composée de personnes qui ne viennent pas bosser avec la boule au ventre !

👉 La **transmission**, c’est comme dans les grandes cuisines : un chef étoilé ne garde jamais ses secrets pour lui. Il montre comment lever un filet, réduire une sauce, dresser une assiette parfaite. Il transforme un commis hésitant en un créateur précis, rapide et sûr de lui. Dans la tech comme en cuisine, les talents rares ne naissent pas “tout faits”. Ils se forment, patiemment.

C’est ça, un vrai mouton à cinq pattes : le résultat de la transmission, pas du hasard.

👉 Comment on crée des seniors... sans former de juniors ?? Je suis preneur. 📝🙂

Et le plus ironique dans tout ça ? Si la tech appliquait à elle-même la logique qu’elle exige des juniors, elle serait déjà en avance de deux versions.

```ts
// TODO: recruter un junior
if (needsDev && juniorCandidate) {
  hire(juniorCandidate);
} else {
  burnOut(team);
}
```

---

## 🧠 Ce que je veux dire, vraiment

Je ne demande pas qu’on me déroule le tapis rouge. Juste qu’on regarde la réalité en face : le secteur se prive lui-même des talents qu’il dit chercher.

---

## 🐍 Conclusion

Je ne suis pas amer, loin s''en faut : je suis motivé, curieux, travailleur. Et conscient du monde dans lequel j’entre. Je suis juste triste de voir un secteur devenir autophage, à force de s’obstiner à chercher ce qu’il refuse de construire.
', 'published', '2026-01-20T00:00:00.000Z', true, '82a73b17-57bc-41cc-213b-cc142a5ce00e', NOW(), NOW()),
('5d826f76-b112-f19f-f128-a0eba00e0983', 'devs-2', 'Quand coder n''est plus ce qui fait la différence 💻 ➡️ 🧠', 'Sur quoi repose réellement la valeur d''un développeur, quand les organisations peinent à jouer leur rôle ?', '
## 🎯 La vraie question qu''on évite

Dans un article précédent, je défendais une idée simple : on ne manque pas de développeurs, mais d''entreprises prêtes à les accueillir correctement.

On parle beaucoup de pénurie. Beaucoup moins de transmission, d''onboarding, de conditions réelles d''apprentissage.

Cette réflexion m''a conduit à une autre question, plus discrète, mais tout aussi structurante 👇

Sur quoi repose réellement la valeur d''un développeur, quand les organisations peinent à jouer leur rôle ?

---

## 💻 Coder correctement n''est plus un critère, c''est un prérequis

Produire du code qui fonctionne est devenu plus courant. Dans beaucoup d''équipes, ce n''est plus ce qui fait la différence.

Coder correctement est devenu un prérequis. Pas un critère.

Dans beaucoup d''équipes, deux développeurs peuvent livrer un résultat techniquement satisfaisant. Et pourtant, ils ne sont pas perçus de la même manière.

La différence ne se joue pas seulement dans le code. Elle se joue dans ce que ce code fait au travail autour de lui.

Dans sa lisibilité.
Dans sa capacité à être repris.
Dans les décisions implicites qu''il fige, parfois sans débat.

---

## 🎭 La charge invisible qu''on ne nomme jamais

Quand le cadre est fragile, quand la transmission est faible, quand les responsabilités sont floues, on attend implicitement de certains développeurs qu''ils fassent correctement ce qui fait pourtant partie du métier :

Comprendre le contexte.
Relier la technique aux usages réels.
Poser les questions nécessaires.

Le problème, ce n''est pas que ces attentes existent. C''est qu''elles s''exercent dans des cadres qui ne donnent pas toujours les moyens de les assumer.

Pas parce que c''est explicitement leur rôle... Mais parce que, sinon, personne ne le fait 🤷♂️

---

## 🔍 Ce qu''on valorise vraiment (sans le dire)

Ce déplacement n''est pas neutre. Il crée des attentes implicites, des critères de valeur rarement formulés. Parfois aussi une forme d''injustice silencieuse, parce que cette charge n''est

ni reconnue,
ni répartie,
ni discutée.

Certains développeurs sont valorisés non pas pour ce qu''ils produisent, mais pour ce qu''ils absorbent :

le flou,
les non-dits,
les angles morts de l''organisation.

👉 Tant que ces attentes resteront implicites, les entreprises continueront à appeler "talent" ce qui est en réalité une capacité à encaisser le désordre.

---

## 🧩 Le vrai problème : une responsabilité collective

Si coder ne suffit plus à faire la différence, ce n''est pas parce que la technique aurait perdu de la valeur. C''est parce que, trop souvent, elle doit compenser ce que les organisations n''assument plus assez clairement :

la transmission,
la clarification,
la responsabilité des décisions.

Et ça, ce n''est pas un sujet de performance individuelle. C''est un sujet de responsabilité collective, et tant qu''il restera implicite, il continuera d''user les mêmes profils 🧩

---

## 💭 La question finale

Si coder ne suffit plus à faire la différence, qu''est-ce que nos organisations attendent vraiment des développeurs… sans toujours le formuler clairement ?

_(Dans la continuité de l''article : « Il ne manque pas de développeurs. Il manque des entreprises prêtes à les accueillir. »)_
', 'published', '2026-01-26T00:00:00.000Z', true, '050aae8f-1bfd-83b8-d602-71c6d69561de', NOW(), NOW()),
('4e4c0d6c-51a4-6f6a-f801-77331767c145', 'devs-3', 'Quand le cadre ne tient plus, ce qu’on attend vraiment des développeurs', 'Après avoir interrogé les conditions d’entrée dans le métier, puis ce qui fait réellement la valeur d’un développeur, une autre question s’est imposée. Que demande-t-on, concrètement, aux développeurs quand le cadre de travail ne tient plus ?', '
Dans des réflexions récentes, j’ai parlé d’accueil, de transmission, et de ce que le cadre de travail fait (ou ne fait pas) aux développeurs.

Après avoir interrogé les conditions d’entrée dans le métier, puis ce qui fait réellement la valeur d’un développeur, une autre question s’est imposée.

# Que demande-t-on, concrètement, aux développeurs quand le cadre de travail ne tient plus ?

---

## 🧩 L’autonomie, mot-valise confortable

Quand une organisation dit chercher des développeurs « autonomes », elle ne parle presque jamais de code.

Elle parle d’une capacité à faire avancer le travail dans des contextes où le cadre n’est pas entièrement posé. Livrer malgré l’incertitude. Décider quand les arbitrages n’ont pas été faits. Comprendre des enjeux métier jamais vraiment explicités.

Sur le principe, rien de choquant. Mais dans la pratique, ce mot recouvre souvent des attentes très différentes, rarement nommées comme telles.

---

## 🛠️ Ce qui fait réellement partie du métier

Comprendre le contexte métier. Relier la technique aux usages réels. Poser les questions nécessaires avant d’implémenter.

Sur ce point, il n’y a pas débat : c’est bien du **travail de développeur**.

Ce n’est ni un bonus, ni une posture héroïque, ni une compétence réservée à quelques profils « plus mûrs ».

Dès lors que le développement ne se réduit pas à écrire du code isolé, c’est le cœur du métier.

---

## ⚠️ Là où le décalage apparaît

Le problème commence quand ces attentes sont posées sans que le cadre permette réellement de les exercer.

- Quand il n’y a pas de temps pour comprendre.
- Pas d’espace pour questionner.
- Pas de responsabilités clairement assumées.
- Et des décisions qui arrivent trop tard (ou jamais)

Dans ces conditions, le travail change de nature. Ce qui devrait être pensé collectivement devient une charge individuelle. Ce qui devrait être explicite devient implicite.

Et ce qui devrait être soutenu devient silencieux.

---

## 🎬 Une scène ordinaire

Un développeur arrive sur un projet en cours. Le périmètre est déjà là. Les décisions aussi, en théorie.

Mais très vite, il comprend que beaucoup de choses n’ont jamais vraiment été tranchées.

Les priorités bougent. Les règles métier sont connues « par quelques personnes ». Les compromis passés ne sont écrits nulle part.

Officiellement, on lui demande d’implémenter. En pratique, on attend qu’il comprenne ce qui n’a pas été formulé, qu’il anticipe les effets de décisions prises ailleurs, et qu’il évite des erreurs dont personne n’a réellement pris la responsabilité.

Il fait son travail, sérieusement.

Mais une partie de ce travail consiste surtout à combler les trous du cadre.

---

## 🧱 De la responsabilité au fardeau

Progressivement, certaines capacités prennent plus de poids que d’autres. Pas celles qui figurent dans les fiches de poste. Pas celles qui sont évaluées formellement.

Mais celles qui permettent de tenir malgré l’instabilité.

Absorber le flou. Composer avec les non-dits. Faire avancer un système dans lequel tout n’est pas structuré.

Ces capacités deviennent décisives, mais rarement reconnues comme telles.

---

## 🗣️ Quand le langage masque le problème

À ce stade, un glissement s’opère. Ce qui relève de la compensation organisationnelle est rebaptisé autrement. On parle de maturité, de hauteur de vue, sens du business.

Parfois même de talent.

Ce vocabulaire est pratique, il évite de nommer ce qui manque réellement dans le cadre. Mais il individualise un problème qui est, au départ, collectif.

---

## 🌱 Une conséquence directe : l’impossibilité d’accueillir des juniors

Ce fonctionnement a une autre conséquence, rarement formulée. Il rend l’arrivée de profils juniors extrêmement difficile.

Non pas parce qu’ils manqueraient de compétences, mais parce qu’un cadre fragile exige, dès le départ, une capacité à compenser, à anticiper, à absorber.

Or c’est précisément ce que l’on ne peut pas raisonnablement attendre de quelqu’un qui arrive. Dans un cadre plus explicite

- où les décisions sont nommées,
- où les responsabilités sont claires,
- où les compromis passés sont documentés

l’onboarding devient tout de suite plus simple. Pas parce que les juniors seraient « mieux formés ». Mais parce que le travail attendu devient lisible.

Assainir le cadre de travail, ce n’est pas seulement améliorer le quotidien des équipes en place. C’est créer les conditions réelles d’accueil des profils juniors, sans leur demander, dès le premier jour, de compenser ce que l’organisation n’a pas encore structuré.

---

## 🎯 Une sélection silencieuse

Quand ces attentes restent implicites, elles finissent par produire un effet de sélection. Pas sur la pertinence des choix. Pas sur la qualité du travail produit. Mais sur la capacité à encaisser. À durer, absorber, compenser.

Ceux qui tiennent sont valorisés. Ceux qui s’épuisent sortent du cadre, souvent en silence.

---

## ❓ La vraie question

La question n’est pas : « faut-il des développeurs plus matures ? » Ils le sont déjà.

La question est plus inconfortable : **sommes-nous prêts à rendre explicites ce que nous attendons réellement d’eux, à organiser le cadre pour que ce travail soit possible, et à en assumer la responsabilité collectivement ?**

Tant que ces attentes resteront implicites, elles continueront de peser sur les mêmes profils. Et à être appelées « talent », là où il s’agit surtout d’une capacité à travailler dans un cadre qui ne tient pas encore.

---

## 🧭 Mot de fin

Ce texte ne propose pas de solution miracle. Il propose une mise à plat. Parce que, dans le travail comme ailleurs, ce qui n’est pas nommé finit toujours par s’user quelque part.', 'published', '2026-02-02T00:00:00.000Z', true, '8ef2305b-1662-5451-5bf6-6c9732326756', NOW(), NOW()),
('a55cd105-4176-8e25-3173-7d00b05b8c03', 'la-stack-est-une-consequence-pas-un-point-de-depart', 'La stack est une conséquence, pas un point de départ ', 'Quand un projet démarre, la vraie question n’est pas la stack, mais le besoin à adresser.  ', '
Quand un projet démarre, la vraie question n’est pas la stack, mais le besoin à adresser.  
Vitrine, application, backend, base de données : chaque cas appelle une structure différente.

Plutôt que de réinventer la roue à chaque fois, j’ai construit un ensemble de bases et de scripts qui m’orientent rapidement vers la bonne solution, le tout encapsulé dans des devcontainers pour démarrer immédiatement, quel que soit l’environnement.

---

## Formaliser l’entonnoir de décision 🧠

Au départ, tous les projets ne se ressemblent pas, mais les mêmes questions reviennent systématiquement.

- Est-ce un site vitrine ou une application ?
- Y a-t-il de la donnée à persister ?
- Faut-il un backend, une API, une base de données ?

Ces questions conditionnent bien plus l’architecture d’un projet que le choix d’un framework.

J’ai donc transformé cette réflexion implicite en quelque chose de plus explicite :  
un **entonnoir de décision**, simple et reproductible.

---

## Un menu de structures adaptées 📋

L’idée est volontairement simple.

En fonction du besoin du projet, je veux pouvoir m’orienter rapidement vers une base adaptée :

- **Vitrine**  
  Structure légère, orientée performance

- **Application**  
  Front et backend clairement séparés

- **Donnée**  
  Schéma, ORM et conventions en place

Chaque base répond à un cas précis, sans chercher à couvrir tous les scénarios possibles.

---

## Réduire les décisions répétées 🔁

Ce travail n’a pas pour objectif d’être exhaustif ou universel.

Il sert surtout à éliminer les décisions que je prenais systématiquement au début de chaque projet :

- structure des dossiers
- outils de base
- conventions
- scripts de démarrage

Une fois ces choix stabilisés, l’énergie peut enfin être mise ailleurs :  
sur le besoin réel du client et la logique métier.

---

## Des structures concrètes : les briques du socle 🧱

Une fois l’entonnoir posé, il restait à le matérialiser.

Plutôt que de maintenir une structure unique censée tout faire, j’ai choisi de construire plusieurs bases ciblées, chacune adaptée à un type de projet précis.

Ces bases ne sont pas des templates figés, mais des **points de départ cohérents**, pensés pour être utilisés en conditions réelles.

Le choix des outils n’est pas un dogme, mais une réponse pragmatique aux projets rencontrés.

---

### Vitrine : une base légère et performante 🚀

Tous les projets n’ont pas besoin d’un backend ou d’une base de données.

Pour une vitrine, l’objectif est simple :
- performance
- clarté
- maintenance minimale

Cette base s’appuie sur Astro :
- rendu statique par défaut
- JavaScript limité au strict nécessaire
- structure claire orientée contenu

L’enjeu n’est pas d’ajouter de la complexité, mais au contraire de **savoir s’arrêter** quand le besoin est simple.

---

### Application : front et backend clairement séparés 🧩

Dès qu’un projet dépasse la simple vitrine, les besoins changent.

Il faut gérer :
- de la logique métier
- des utilisateurs
- des échanges avec une API

Pour ces cas, j’ai mis en place un monorepo structuré autour :
- d’un backend Express
- d’un front Vue
- de conventions claires entre les deux

Ce choix facilite :
- la cohérence des contrats
- l’évolution du projet
- l’onboarding d’un autre développeur

---

### Base de données : anticiper sans sur-ingénierie 🗄️

Ajouter une base de données change profondément la nature d’un projet.

Les erreurs deviennent plus coûteuses et les choix initiaux pèsent plus longtemps.

Pour ces projets, j’ai intégré dès le départ :
- un ORM (Prisma)
- un schéma explicite
- des conventions pour les migrations

L’objectif n’est pas de tout prévoir, mais d’avoir une base saine pour faire évoluer le projet sans repartir de zéro.

---

## Le devcontainer comme socle commun 🐳

Ces structures auraient peu d’intérêt si leur mise en place dépendait encore de la machine ou de l’environnement du développeur.

Chaque base est pensée pour être utilisée directement dans un devcontainer :
- mêmes versions d’outils
- mêmes scripts
- même comportement, quel que soit l’OS

**Ouvrir le projet, coder, point.**

Cela permet :
- d’éviter les “ça marche chez moi”
- de faciliter l’onboarding
- de garantir une compatibilité maximale entre environnements

---

## Des scripts au service du besoin ⚙️

Autour de ces bases, j’ai progressivement ajouté des scripts pour :
- initialiser un projet
- lancer les services nécessaires
- rester cohérent d’un projet à l’autre

Ils ne cherchent pas à être magiques.  
Ils existent surtout pour réduire les frictions et automatiser ce qui n’a pas besoin d’être redécidé.

---

## Ce que je ferais différemment aujourd’hui 🔍

Avec le recul, une chose me paraît importante à préciser :  
les choix de frameworks et d’outils présentés ici sont avant tout **des choix personnels**.

Ils sont directement liés aux projets que j’ai eu à réaliser jusqu’ici, à leurs contraintes, et à ce que je cherchais à optimiser à ce moment-là.

Certains de ces socles sont d’ailleurs partis de templates existants, que j’ai progressivement adaptés et revisités à ma façon.  
Un peu comme un cuisinier qui part d’une recette existante, puis la revisite selon son goût, ses outils et le contexte.

Avec plus d’expérience, je referais probablement certains choix différemment.  
Et c’est normal.

L’objectif n’est pas de figer une stack idéale, mais de structurer une manière de réfléchir :
- partir du besoin
- limiter les décisions répétées
- construire des bases suffisamment saines pour évoluer

Ces repositories sont moins une vérité technique qu’un instantané de mon parcours à un moment donné.

---

## Ce que ce socle dit de ma façon de travailler ✨

Ce travail n’a pas été motivé par l’envie de créer la bonne stack, mais par celle de mieux travailler au quotidien.

Formaliser un entonnoir de décision, stabiliser des bases réutilisables et développer dans des environnements reproductibles m’a appris une chose essentielle :

**la qualité d’un projet se joue souvent avant la première feature.**

Aujourd’hui, ce socle me sert de garde-fou.  
Il m’aide à éviter de réinventer la roue, à démarrer vite, et à rester concentré sur ce qui apporte réellement de la valeur.

---
C''est cadeau ☺️

👉[Boilerplate Astro](https://github.com/MaksTinyWorkshop/Boilerplate_Vitrine_Astro)

👉[Boilerplate App](https://github.com/MaksTinyWorkshop/Boilerplate_Monorepo_Express_Vue_Prisma)

👉[Devcontainer "Framework"](https://github.com/MaksTinyWorkshop/devcontainer-framework)', 'published', '2025-10-30T00:00:00.000Z', true, NULL, NOW(), NOW());

-- Liaison articles → auteurs
INSERT INTO "ArticlePerson" (id, "articleId", "personId", role, "order", "primary", "createdAt", "updatedAt") VALUES
('c7ec2aa5-bd95-53c3-9d62-47abd8ad8d62', '5dc9a3f6-3d5c-28fc-d0fd-93a6d358a9e0', '62cded6b-b881-d682-d8be-815775b7b164', 'Auteur principal', 1, true, NOW(), NOW()),
('0c97f7f3-cf52-4fd0-1ebc-5cfcfc5316a6', '5d826f76-b112-f19f-f128-a0eba00e0983', '62cded6b-b881-d682-d8be-815775b7b164', 'Auteur principal', 1, true, NOW(), NOW()),
('e90c8785-a408-2ae9-aad0-223f7da44b3a', '4e4c0d6c-51a4-6f6a-f801-77331767c145', '62cded6b-b881-d682-d8be-815775b7b164', 'Auteur principal', 1, true, NOW(), NOW()),
('f77589ab-6960-700f-59f8-1e6403b50d68', 'a55cd105-4176-8e25-3173-7d00b05b8c03', '62cded6b-b881-d682-d8be-815775b7b164', 'Auteur principal', 1, true, NOW(), NOW());

-- Liaison articles → tags
INSERT INTO "ArticleTag" (id, "articleId", "tagId", "createdAt", "updatedAt") VALUES
('4dd43e40-154d-ab55-0802-f4c2e36b8ac2', '5dc9a3f6-3d5c-28fc-d0fd-93a6d358a9e0', '63e3cd64-45f0-7193-affd-53a9102e1ef6', NOW(), NOW()),
('525621b2-d077-a076-5afd-e70637075b5b', '5d826f76-b112-f19f-f128-a0eba00e0983', '63e3cd64-45f0-7193-affd-53a9102e1ef6', NOW(), NOW()),
('a99ba14b-87a0-b805-e0d7-a9da627cbadc', '4e4c0d6c-51a4-6f6a-f801-77331767c145', 'be94ba0c-4aa8-164f-fbec-d18f6dc96dcc', NOW(), NOW()),
('9af9b5b8-d64b-1461-c338-1257fb8949eb', 'a55cd105-4176-8e25-3173-7d00b05b8c03', 'e51e1bcd-fce4-0087-73e1-771f2b9caba0', NOW(), NOW());

-- Insertion des projets
INSERT INTO "Project" (id, slug, title, summary, content, status, "publishedAt", link, repository, "createdAt", "updatedAt") VALUES
('b997d961-b22b-6126-7a77-8dd648c02b76', 'agence-communication', 'C''Com', 'Site vitrine moderne et performant pour une agence de communication spécialisée en écrans publicitaires, conçu avec Astro pour des performances optimales.', '
## Le Besoin Métier

L''agence de communication C''Com spécialisée dans les écrans publicitaires avait besoin d''une présence web professionnelle pour :

- Présenter leurs sservices et leur expertise
- Mettre en avant leurs réalisations
- Faciliter la prise de contact avec leurs prospects
- Se démarquer dans un secteur concurrentiel

## L''Approche

**Vitrine rapide et efficace** : Le client avait besoin d''un site en ligne rapidement, sans complexité technique inutile.

Ma proposition :

- Un site statique ultra-performant avec Astro
- Un design moderne et épuré
- Une optimisation SEO poussée pour le référencement local
- Une expérience utilisateur fluide sur tous les appareils

## La Solution

### Caractéristiques Techniques

- **Framework** : Astro pour des performances maximales
- **Design** : Responsive, mobile first
- **SEO** : Optimisation complète pour le référencement
- **Performance** : Temps de chargement minimal, images optimisées
- **Accessibilité** : Respect des standards WCAG

### Fonctionnalités

- Page d''accueil impactante présentant les services
- Galerie de réalisations
- Page de présentation de l''équipe
- Formulaires de contact
- Design adaptatif pour tous les écrans

## Technologies Utilisées

- **Astro** : Framework moderne pour sites statiques ultra-rapides
- **CSS/SCSS** : Styling responsive et maintenable
- **JavaScript** : Interactions légères et performantes
- **Optimisation** : Images WebP, lazy loading, minification

## Résultat

Un site vitrine professionnel, rapide et efficace qui permet à l''agence de :

- Présenter son expertise avec élégance
- Convertir les visiteurs en prospects qualifiés
- Se positionner comme un acteur moderne et professionnel
- Bénéficier d''excellentes performances SEO

---

> _Exemple type d''un projet "site vitrine" : rapide, performant, professionnel. Quand vous avez besoin d''une présence web efficace sans complexité inutile._
', 'published', '2024-11-01T00:00:00.000Z', 'https://c-com.fr/', NULL, NOW(), NOW()),
('007df7e6-512d-01ea-500d-bacabc612f59', 'artisan-velux', 'Envolet'' Toit ', 'Site vitrine avec formulaire de contact optimisé + capture de leads pour un artisan spécialisé en accessoires Velux couvrant la Bretagne et la Normandie.', '
## Le Besoin Métier

Un artisan spécialisé dans l''installation et dépannage d''accessoires de fenêtres de toit Velux, couvrant la Bretagne et la Normandie, avait besoin de :

- Une présence web professionnelle pour inspirer confiance
- Un outil de capture de leads efficace
- Une mise en avant de son expertise et de sa zone géographique
- Un site simple à maintenir

## L''Approche

**Vitrine + Conversion** : Au-delà de la simple présentation, l''objectif était de transformer les visiteurs en demandes de devis qualifiées.

Questions posées :

- Quelles informations les clients potentiels recherchent-ils ?
- Comment simplifier la prise de contact ?
- Comment mettre en avant la zone géographique couverte ?
- Quels sont les critères de confiance pour un artisan ?

## La Solution

### Site Vitrine Optimisé

Un site conçu avec Astro qui combine :

- **Présentation professionnelle** : Mise en valeur de l''expertise Velux
- **Zone géographique claire** : Bretagne et Normandie bien identifiées
- **Formulaire de contact intuitif** : Capture de leads simplifiée
- **Preuves de confiance** : Certifications, garanties, témoignages

### Fonctionnalités Clés

- Page d''accueil impactante avec call-to-action clair
- Présentation des services et de l''expertise
- CTA optimisé pour la conversion
- Galerie de réalisations

## Technologies Utilisées

- **Astro** : Performance et SEO optimaux
- **Formulaire** : Intégration simple et sécurisée
- **CSS/SCSS** : Design responsive et moderne
- **Optimisation SEO** : Référencement local (Bretagne, Normandie, Velux)

## Résultat

Un site vitrine qui sert de véritable outil commercial :

- Présence web professionnelle inspirant confiance
- Génération de demandes de devis qualifiées
- Référencement local optimisé
- Taux de conversion visiteurs → leads maximisé
- Maintenance simple pour le client

---

> _Exemple de projet vitrine "augmenté" : pas seulement montrer, mais aussi convertir. La présence web comme outil de développement commercial._
', 'published', '2024-12-01T00:00:00.000Z', 'https://envolettoit.fr', NULL, NOW(), NOW()),
('e3cabbf6-46ca-ebe7-52c9-7dd9c0c9bf2c', 'endo-sens', 'Endo-sens', 'Page de présentation pour un stage de préparation dans le domaine de la santé et du bien-être féminin.', '
## Le Besoin Métier

Endo-sens propose un stage de préparation dans le domaine de la santé et du bien-être féminin, prévu pour mars de cette année. Le besoin était de créer une landing page efficace pour :

- Présenter le stage et ses bénéfices
- Capter l''attention des participantes potentielles
- Faciliter les inscriptions
- Transmettre les valeurs de bienveillance et d''accompagnement

Site Web à venir, consécutivement aux stages

## L''Approche

**Landing Page Ciblée** : Une page unique, impactante, avec un objectif clair : convertir les visiteurs en inscriptions.

Questions essentielles :

- Quel message principal faire passer ?
- Comment créer la confiance dans un domaine sensible (santé féminine) ?
- Quels éléments rassurants mettre en avant ?
- Comment simplifier le parcours d''inscription ?

## La Solution

### Landing Simple et Optimisée

Conçue avec soin pour maximiser la conversion :

- **Message clair et empathique** : Ton bienveillant adapté au public cible
- **Présentation du stage** : Bénéfices, contenu, approche
- **Appel à l''action évident** : Inscription facilitée
- **Éléments de réassurance** : Expertise, témoignages, garanties

### Fonctionnalités Clés

- Hero section impactante avec accroche claire
- Présentation du contenu du stage
- Section bénéfices / transformations attendues
- Présentation des intervenant(e)s
- Formulaire d''inscription ou pré-inscription
- Design apaisant et rassurant

## Technologies Utilisées

- **Pur HTML/CSS** : Très léger, aucun besoin d''infrastructure lourde
- **Design** : Interface douce, rassurante, adaptée au sujet
- **Formulaire** : Inscription simple et sécurisée via Google Form

## Contexte

**Lancement prévu** : Mars 2025

Cette landing page s''inscrit dans un projet à dimension sociale et humaine, axé sur le bien-être et la santé féminine. Le site met l''accent sur :

- L''empathie et la compréhension des enjeux
- La clarté de l''information
- La facilité d''accès et d''inscription
- Un design qui reflète les valeurs du projet

## Impact Attendu

- Présentation professionnelle et rassurante du stage
- Maximisation du taux de conversion visiteurs → inscriptions
- Communication claire des bénéfices et de l''approche
- Création de confiance dans un domaine sensible

---

> _Projet à impact social dans le domaine de la santé féminine. Exemple de landing page ciblée avec une approche empathique et bienveillante._
', 'published', '2026-01-01T00:00:00.000Z', 'https://www.endo-sens.fr/', 'https://github.com/MaksTinyWorkshop/Endosens-Stage', NOW(), NOW()),
('88bfd9a8-dd50-e098-471f-d7c55c830f5e', 'juriscope', 'Juriscope', 'Plateforme collaborative de gestion documentaire juridique pensée pour durer. De la modélisation des données à la mise en production : une solution sur mesure pour centraliser, organiser et sécuriser la connaissance juridique d''équipes collaboratives.', '
## Le Besoin Métier

**Juriscope** répond au besoin d''une plateforme centralisée de **gestion et d''archivage de documents juridiques** pour des équipes collaboratives. Le projet adresse plusieurs problématiques :

- **Centralisation documentaire** : Regrouper l''ensemble des documents juridiques (articles, décisions, commentaires) en lien avec des ouvrages et auteurs de référence
- **Versioning et archivage** : Gérer le cycle de vie complet des documents (brouillon → publié → obsolète) avec traçabilité complète des versions
- **Collaboration structurée** : Permettre à des équipes d''utilisateurs d''annoter, commenter et organiser collectivement la documentation juridique
- **Organisation par métadonnées** : Système flexible de tags hiérarchiques pour classifier et retrouver rapidement l''information
- **Sécurité et droits d''accès** : Contrôler finement qui peut consulter, créer, modifier, publier ou supprimer des documents selon des profils de droits

## Les Questions Posées

Le projet répond à ces questions clés :

1. **Comment gérer efficacement plusieurs versions d''un même document juridique ?**
2. **Comment organiser une base documentaire sans structure fixe prédéfinie ?**
3. **Comment intégrer des données juridiques officielles externes ?**
4. **Comment garantir la sécurité des données sensibles ?**
5. **Comment permettre l''annotation personnelle sans polluer la base commune ?**

## La Solution Sur Mesure

### Architecture Technique

- Architecture 3-tiers moderne
- Intégrations externes :
  - Keycloak (OAuth2/OpenID Connect)
  - Legifrance API (données juridiques)
- Patterns architecturaux utilisés:
  - **DAO Pattern** : Abstraction de l''accès aux données avec interfaces génériques
  - **Service Layer Pattern** : Logique métier isolée dans des services réutilisables
  - **DTO Pattern** : Séparation entités persistantes / objets de transfert avec ModelMapper
  - **Generic Repository** : GenericDao et GenericService pour mutualiser le code CRUD
  - **Resource Server OAuth2** : Délégation d''authentification à Keycloak
  - **Reactive Programming** : WebFlux pour les appels API externes

### Fonctionnalités Clés

1. **Gestion Documentaire Complète**
2. **Système de Versioning Intelligent**
3. **Organisation par Tags Hiérarchiques**
4. **Collaboration Multi-utilisateurs**
5. **Référentiels Métier**
6. **Intégration API Externe**
7. **Sécurité Renforcée**

## Technologies Utilisées

### Backend

- **Java 21** - Langage principal
- **Spring Boot 3.3.1** - Framework applicatif
- **Spring Security** - Authentification OAuth2/JWT, CSRF, CORS
- **Spring WebFlux** - Client HTTP réactif pour API externes
- **MyBatis 3.0.3** - Mapper objet-relationnel (ORM)
- **MariaDB** - Base de données relationnelle
- **ModelMapper 3.2.0** - Conversion Bean/DTO
- **JSoup 1.18.1** - Parsing HTML
- **GSON 2.11.0** - Sérialisation JSON

### Frontend

- **Angular 18.0.6** - Framework SPA
- **TypeScript 5.4.2** - Langage
- **Bootstrap 5.3.3** - UI/CSS
- **Keycloak-Angular 16.0.1** - Intégration authentification
- **D3.js 7.9.0** + d3-org-chart - Visualisations (organigrammes)
- **ng-select 13.4.1** - Sélecteurs avancés
- **ngx-toastr 19.0.0** - Notifications
- **CryptoJS 4.2.0** - Cryptographie côté client

### Sécurité & Infrastructure

- **Keycloak 25.0.1** - Serveur d''identité (IAM)
- **OAuth2 / OpenID Connect** - Protocoles d''authentification
- **JWT** - Tokens d''accès

### Outils de build

- **Maven 3.x** - Gestion de dépendances backend
- **npm / Angular CLI** - Gestion frontend

## Défis et Apprentissages

### Défis techniques rencontrés

1. **Gestion complexe du versioning**
2. **Sécurité multi-couches**
3. **Architecture générique réutilisable**
4. **Intégration API externe avec authentification**
5. **Tags hiérarchiques flexibles**
6. **Protection CSRF en architecture SPA**

### Apprentissages clés

- Maîtrise de **MyBatis** pour mapping SQL complexe (requêtes avec associations multiples)
- Intégration **OAuth2 Resource Server** avec Keycloak
- Gestion d''**architecture générique** pour réduire la duplication de code
- Implémentation de **patterns d''entreprise** (DAO, Service Layer, DTO)
- **Programmation réactive** avec Spring WebFlux pour appels API

## Impact

### Statut actuel

- Version **1.2** en développement actif

### Bénéfices attendus

1. **Gain de productivité**
   - Réduction du temps de recherche documentaire grâce au système de tags et filtres
   - Centralisation de toute la documentation juridique (élimination de sources dispersées)

2. **Amélioration de la qualité**
   - Versioning intégral : traçabilité complète des modifications
   - Validation par publication : séparation brouillons/documents validés
   - Annotations collaboratives pour enrichissement continu

3. **Sécurité et conformité**
   - Contrôle d''accès granulaire par profil de droits
   - Authentification centralisée (SSO Keycloak)
   - Traçabilité complète (qui a créé/modifié quoi et quand)

4. **Collaboration renforcée**
   - Travail d''équipe structuré autour de tags communs
   - Notes personnelles pour annotations privées
   - Système de responsabilité par équipe

5. **Enrichissement automatique**
   - Intégration future de données Legifrance officielles
   - Possibilité d''enrichir la base avec des sources externes validées

6. **Évolutivité**
   - Architecture générique facilitant l''ajout de nouvelles entités
   - Système de tags flexible s''adaptant à toute taxonomie
   - API REST documentée pour intégrations futures

---

_Ce rapport reflète un projet d''application d''entreprise robuste pour la gestion documentaire juridique, avec une architecture moderne et des standards industriels (Spring Boot, OAuth2, SPA Angular), en CI/CD._
', 'published', '2024-07-01T00:00:00.000Z', NULL, NULL, NOW(), NOW()),
('f3473f35-2d1d-4546-96e2-a65b1c9b0c0a', 'portfolio-new', 'Portfolio professionnel', 'Vue d''ensemble d''un écosystème digital complet (site public, admin, documentation) construit sur Next.js + PostgreSQL/Prisma.', '
## Le Besoin Métier

Le site doit réunir une vitrine publique haut de gamme, une administration opérationnelle et une documentation source unique pour piloter tous les projets, articles et obligations légales.

## Les Questions Posées

- Comment offrir une expérience visuelle Next.js/Once UI tout en s''appuyant sur une seule base de données (MDX + PostgreSQL/Prisma) ?
- Comment automatiser publication/revalidation tout en gardant l''admin sécurisé (JWT, RouteGuard, refresh token) ?
- Comment centraliser la documentation technique sans multiplier les doublons ?

## La Solution Sur Mesure

### Architecture Technique

- Next.js 16 App Router + React Server Components pour la couche publique et la page mentions légales.
- Once UI comme design system (Line, RevealFx, Badge, etc.) et composants MDX personnalisés (`mdx.tsx`).
- PostgreSQL 16 + Prisma 7 pour les projets/articles/tags/médias/disponibilités avec validation Zod (`metadata + content`).
- APIs admin (`/api/admin/projects`, `/api/admin/posts`, `/api/admin/publish`, `/api/availability`) + Docker Compose + scripts de seed.

### Fonctionnalités Clés

- Hero, sections "Dernier projet", "Derniers articles", "Autres projets" et page Mentions légales réactives.
- Dashboard admin avec stats, QuickAction, formulaires projet/article, gestion disponibilité, uploads images et validation.
- Publication automatisée (commits + revalidation des routes) et documentation Hub & Spoke (docs/index, project-overview, architecture, development-guide).

## Technologies Utilisées

- Frontend : Next.js 16, React 19, TypeScript 5.8, Once UI 1.5.6, next-mdx-remote.
- Backend & données : Node.js, Prisma/PostgreSQL, JWT, Zod, API REST.
- Ops : Docker Compose, Biome, ESLint, lint-staged, pipelines `npm run dev` / `npm run build`, revalidation Next.js.

## Défis et Apprentissages

- Synchroniser SSR/SSG/CSR avec PostgreSQL et MDX sans multiplier les requêtes.
- Structurer la documentation en Hub & Spoke pour éviter toute duplication.
- Assurer la sécurité admin (RouteGuard, JWT, refresh token) tout en gardant la publication fluide.
- Valider les payloads `metadata + content` issus du formulaire admin.

## Impact

**Statut actuel** : production-ready, dashboard admin déployé, documentation alignée, pipeline push + revalidation opérationnel.

**Bénéfices attendus** : crédibilité accrue, gouvernance documentaire fiable, publication instantanée des projets/articles et base extensible pour nouveaux cas d''usage.
', 'published', '2026-02-09T00:00:00.000Z', 'https://portfolio.dinodev.me', 'https://github.com/MaksTinyWorkshop/Porfolio_new', NOW(), NOW()),
('436eef20-203d-83bf-cf5b-2eb0d5061b69', 'khimaira', 'Khimaira', 'Premier de mes sites vitrine mis en production pour des amis restaurateurs Rennais, refondu depuis.', '
## Le Besoin Métier

Des amis restaurateurs qui se lançaient avaient besoin d''une présence en ligne, et moi d''un projet pour me faire la main. Le but était:

- Une présence web professionnelle pour inspirer confiance
- Une mise en avant de leur carte et atypicité
- Un site simple à maintenir

## L''Approche

**Vitrine** : Au-delà de la simple présentation, l''objectif était de transformer les visiteurs en réservation, simplement, en dehors de toute interface payante (La Fourchette, Trip Advisor,...).

Questions posées :

- Quelles informations les clients potentiels recherchent-ils ?
- Comment simplifier la prise de contact ?
- Comment mettre en avant la zone géographique couverte ?

## La Solution

### Site Vitrine Optimisé

Un site conçu avec React qui combine :

- Présentation simple
- Menu avec tarif clair et lisible

## Technologies Utilisées

- **React** : Performance
- **Hébergement Git** : Intégration simple et sécurisée
- **CSS/SCSS** : Design responsive et moderne
- **Optimisation SEO** : Référencement local

## Résultat

Un mini site vitrine qui sert de carte de visite :

- Présence web
- Appels
- Référencement local optimisé
- Maintenance très simple

---
', 'published', '2024-01-01T00:00:00.000Z', NULL, 'https://github.com/MaksTinyWorkshop/khimaira', NOW(), NOW()),
('6348c29a-41f8-1567-2ce8-0484d6d7cab2', 'porfolio-old', 'Ancien Portfolio', 'Portfolio personnel moderne : une vitrine web construite à partir d’un starter Astro et adaptée à mes besoins pro du moment. Il n''est plus en ligne évidemment, remplacé par le présent site web.', '
## Le Besoin Métier

Créer une présentation professionnelle en ligne de mon profil / mes projets sur Internet. Le site sert de vitrine portfolio, avec un code propre et déployable, pour mettre en avant mes compétences et réalisations, et être visible aussi bien sur mobile que desktop.

## L''Approche

Utiliser Astro Starter Kit: Portfolio comme base, puis personnaliser le contenu pour qu’il reflète mon identité, lister mes projets, compétences et expériences. Le projet est structuré pour être léger, facilement modifiable et optimisé pour le web moderne.

- un système clair de pages (Home, Projets, Contact…)
- une typographie et style cohérents
- des sections modulaires réutilisables
- un déploiement simple (Netlify / Vercel / GitHub Pages)

## La Solution

### Caractéristiques Techniques

- Basé sur Astro Starter Kit → static site performant.
- Structure modulaire avec src/ (Astro/TS/CSS).
- Scripts npm classiques (dev, build, preview).
- SEO & best practices intégrés via Astro.

### Fonctionnalités

- Serveur de développement local avec hot-reload (npm run dev).
- Build statique optimisé (npm run build).
- Preview du build local (npm run preview).
- Navigation simple et pages portfolio.

(Cf. ce qui est visible dans la doc du projet.)

## Technologies Utilisées

- **Astro** : Framework moderne pour sites statiques ultra-rapides
- **CSS/SCSS + TypeScript** : Styling responsive et maintenable
- **Optimisation** : Images WebP, lazy loading, minification

## Résultat

Un site portfolio statique, rapide, maintenable, prêt à être déployé (sur Netlify, Vercel, GitHub Pages, etc.). Le projet est organisé, basé sur un starter éprouvé et conçu pour présenter efficacement mon profil de développeur.', 'published', '2024-04-01T00:00:00.000Z', NULL, 'https://github.com/MaksTinyWorkshop/Portfolio', NOW(), NOW()),
('e9d0f34f-0608-43be-31c9-3089a61f50c9', 'webapp-maconnique', 'Trois Points', 'Solution métier sur mesure pour la gestion complète de la vie interne d''une loge maçonnique : orchestration rituelle, gestion administrative et transmission des savoirs.', '
## Le Besoin Métier

La gestion d''une loge maçonnique implique des processus complexes et spécifiques : orchestration des cérémonies rituelles, suivi administratif des membres, gestion documentaire sensible, et transmission fluide des responsabilités lors des passations de postes.

Le défi était plus que triple :

- **Éviter la perte d''information** lors des changements de dirigeants
- **Fluidifier les passations de postes** avec une documentation centralisée
- **Orchestrer la dimension rituelle** tout en respectant la confidentialité des données

## Les Questions Posées

J''ai dû prendre le temps de comprendre :

- Quels sont les workflows spécifiques d''une loge maçonnique ?
- Comment gérer des données sensibles avec les niveaux de confidentialité appropriés ?
- Quelles sont les informations critiques à ne jamais perdre lors d''une passation ?
- Comment rendre l''outil intuitif pour des utilisateurs non-techniques ?

## La Solution Sur Mesure

### Architecture Technique

**Stack complète adaptée aux besoins** :

- **Front-end** : Interface intuitive et responsive
- **Back-end** : API robuste avec authentification sécurisée
- **Base de données** : PostgreSQL pour la gestion des données relationnelles
- **Sécurité** : Chiffrement des données sensibles, gestion granulaire des permissions

### Fonctionnalités Clés

- **Gestion des membres** : Suivi complet des parcours et des responsabilités
- **Orchestration rituelle** : Planification et suivi des cérémonies avec workflows dédiés
- **Documentation centralisée** : Base de connaissances accessible selon les permissions
- **Passations automatisées** : Transfert guidé des responsabilités avec checklists
- **Tableau de bord** : Vue d''ensemble de la vie de la loge en temps réel

## Technologies Utilisées

- **Front-end** : Vue.js, TypeScript
- **Back-end** : NestJS, TypeScript
- **Base de données** : PostgreSQL
- **Architecture** : Monorepo
- **DevOps** : Docker, CI/CD
- **Sécurité** : JWT, chiffrement des données sensibles

## Défis et Apprentissages

Le principal défi a été de transformer une compréhension profonde d''un domaine métier très spécifique (les rituels et l''organisation maçonnique) en une architecture logicielle intuitive.

La solution a consisté à :

- Mener des sessions de découverte approfondies avec les utilisateurs finaux
- Créer des workflows qui respectent les traditions tout en modernisant les processus
- Concevoir une interface qui "ne nécessite pas de mode d''emploi"

## Impact

**Statut actuel** : En cours de développement

**Bénéfices attendus** :

- Transmission fluide des responsabilités sans perte d''information
- Prise de poste sereine pour les nouveaux dirigeants
- Centralisation de la connaissance et de la documentation
- Gain de temps sur les tâches administratives
- Sécurité et confidentialité des données garanties

---

> _Ce projet illustre parfaitement mon approche : partir d''une compréhension métier approfondie pour concevoir l''outil numérique sur mesure qui répond vraiment aux besoins._
', 'published', '2025-01-01T00:00:00.000Z', NULL, NULL, NOW(), NOW());

-- Liaison projets → tags
INSERT INTO "ProjectTag" (id, "projectId", "tagId", "createdAt", "updatedAt") VALUES
('72c63d3f-fbea-5f01-923d-312d8f55002e', 'b997d961-b22b-6126-7a77-8dd648c02b76', 'a775e468-65b3-9037-fa59-7184232d4f25', NOW(), NOW()),
('bbe1c3a6-a73e-2970-b42a-9b0f17a40e4d', 'b997d961-b22b-6126-7a77-8dd648c02b76', 'b845869b-2d26-cbde-51d8-ad52acd4e0eb', NOW(), NOW()),
('03248e76-818d-cae5-c53d-d47094e3d8a3', '007df7e6-512d-01ea-500d-bacabc612f59', 'a775e468-65b3-9037-fa59-7184232d4f25', NOW(), NOW()),
('22f9a6eb-56ee-1139-1138-dc342ff0632c', '007df7e6-512d-01ea-500d-bacabc612f59', 'b845869b-2d26-cbde-51d8-ad52acd4e0eb', NOW(), NOW()),
('1bc791a6-11b7-fc92-cf87-32c46166165a', 'e3cabbf6-46ca-ebe7-52c9-7dd9c0c9bf2c', 'a775e468-65b3-9037-fa59-7184232d4f25', NOW(), NOW()),
('d9cfff4e-086a-3554-bb4d-49889bfa9b0a', 'e3cabbf6-46ca-ebe7-52c9-7dd9c0c9bf2c', 'b845869b-2d26-cbde-51d8-ad52acd4e0eb', NOW(), NOW()),
('1c633159-8a32-7266-090c-33a9d5961ad2', '88bfd9a8-dd50-e098-471f-d7c55c830f5e', 'a775e468-65b3-9037-fa59-7184232d4f25', NOW(), NOW()),
('8a72bf1e-1a57-aeb8-e587-410e703168af', '88bfd9a8-dd50-e098-471f-d7c55c830f5e', 'd5136f80-be8c-ebea-b639-bd9860bf2e45', NOW(), NOW()),
('bc68ba78-d8a4-de22-a9f6-d4965ade15e1', '88bfd9a8-dd50-e098-471f-d7c55c830f5e', '1f2194b3-ce5c-0aa5-2b13-52ebb1f1156d', NOW(), NOW()),
('08df08b8-562a-8ea1-655d-6c2674ab5c22', '436eef20-203d-83bf-cf5b-2eb0d5061b69', 'a775e468-65b3-9037-fa59-7184232d4f25', NOW(), NOW()),
('e82dcb49-8a4f-5d8b-9f7f-c38a0b9ae404', '436eef20-203d-83bf-cf5b-2eb0d5061b69', 'b845869b-2d26-cbde-51d8-ad52acd4e0eb', NOW(), NOW()),
('cc2876f7-96ec-734f-306e-85625d5fc47e', '6348c29a-41f8-1567-2ce8-0484d6d7cab2', 'a775e468-65b3-9037-fa59-7184232d4f25', NOW(), NOW()),
('304296ed-631c-f3db-c840-ecd100de36a1', '6348c29a-41f8-1567-2ce8-0484d6d7cab2', 'b845869b-2d26-cbde-51d8-ad52acd4e0eb', NOW(), NOW()),
('3e2ef760-9fa8-91a2-29c5-fa6ce06096ee', 'e9d0f34f-0608-43be-31c9-3089a61f50c9', 'a775e468-65b3-9037-fa59-7184232d4f25', NOW(), NOW()),
('040ddb16-41dd-6b22-e03a-5e7362f0c9fd', 'e9d0f34f-0608-43be-31c9-3089a61f50c9', '1f2194b3-ce5c-0aa5-2b13-52ebb1f1156d', NOW(), NOW()),
('1e6d5cba-9f77-4920-b5dc-0f61f88ea5e3', 'f3473f35-2d1d-4546-96e2-a65b1c9b0c0a', 'a775e468-65b3-9037-fa59-7184232d4f25', NOW(), NOW()),
('3d77b472-ff57-4c34-8852-f5ab7283cbfb', 'f3473f35-2d1d-4546-96e2-a65b1c9b0c0a', '1f2194b3-ce5c-0aa5-2b13-52ebb1f1156d', NOW(), NOW()),
('4f6d0c73-af33-45e2-85c8-c658a62d0f55', 'f3473f35-2d1d-4546-96e2-a65b1c9b0c0a', '5c89d3e9-8a7d-4f86-8b66-1b0ef490f3cf', NOW(), NOW());

-- Liaison projets → personnes
INSERT INTO "ProjectPerson" (id, "projectId", "personId", role, "order", "primary", "createdAt", "updatedAt") VALUES
('511bd1ab-6677-7ff0-e517-4c520507241e', 'b997d961-b22b-6126-7a77-8dd648c02b76', '6bd9d1ea-279e-3ae9-2294-177c7469bd30', 'Développeur Full Stack', 1, true, NOW(), NOW()),
('3ec50986-8f02-5885-1ab5-387571c2346b', '007df7e6-512d-01ea-500d-bacabc612f59', '6bd9d1ea-279e-3ae9-2294-177c7469bd30', 'Développeur Full Stack', 1, true, NOW(), NOW()),
('bb31665a-c096-8b0d-bb51-8b717fb84167', 'e3cabbf6-46ca-ebe7-52c9-7dd9c0c9bf2c', '6bd9d1ea-279e-3ae9-2294-177c7469bd30', 'Développeur Full Stack', 1, true, NOW(), NOW()),
('28912b69-bcd6-0355-909d-3aa750f2369e', '88bfd9a8-dd50-e098-471f-d7c55c830f5e', '6bd9d1ea-279e-3ae9-2294-177c7469bd30', 'Développeur Full Stack', 1, true, NOW(), NOW()),
('9247f1ca-b5fc-a208-6c49-2d4ec550b8d1', '88bfd9a8-dd50-e098-471f-d7c55c830f5e', '406eeaf3-15e9-d7a6-9f5c-47c96d35b2c8', 'Développeur Full Stack', 2, false, NOW(), NOW()),
('e63ba989-3cc8-6bd4-c08f-c54bc64b02bb', '436eef20-203d-83bf-cf5b-2eb0d5061b69', '6bd9d1ea-279e-3ae9-2294-177c7469bd30', 'Développeur Full Stack', 1, true, NOW(), NOW()),
('a3efa5f4-5a58-24b8-04d0-d001f9ba75bc', '6348c29a-41f8-1567-2ce8-0484d6d7cab2', '6bd9d1ea-279e-3ae9-2294-177c7469bd30', 'Développeur Full Stack', 1, true, NOW(), NOW()),
('708e889b-f50d-f55f-9095-123562ca16c6', 'e9d0f34f-0608-43be-31c9-3089a61f50c9', '6bd9d1ea-279e-3ae9-2294-177c7469bd30', 'Développeur Full Stack', 1, true, NOW(), NOW()),
('a12f2d6c-5bdf-4a4f-8c20-90b1d1c839fd', 'f3473f35-2d1d-4546-96e2-a65b1c9b0c0a', '62cded6b-b881-d682-d8be-815775b7b164', 'Développeur Full Stack', 1, true, NOW(), NOW());

-- Liaison projets → images
INSERT INTO "ProjectImage" (id, "projectId", "mediaId", purpose, "order", "createdAt", "updatedAt") VALUES
('44c2943a-48e2-5f99-958a-90f2c13580d1', 'b997d961-b22b-6126-7a77-8dd648c02b76', '7db0dbe9-cf21-bb4a-014c-8f7ab0e0836f', 'cover', 0, NOW(), NOW()),
('c05e6161-b9a0-a9c3-dd09-c9200afe7253', 'b997d961-b22b-6126-7a77-8dd648c02b76', '919ee17e-6253-5bb3-f998-8c31b10a13dc', 'gallery', 1, NOW(), NOW()),
('19b3a5ca-1f4d-928b-3cd5-ef211c6b27c4', 'b997d961-b22b-6126-7a77-8dd648c02b76', '38c04e17-9f17-613a-b2cf-993cb2fe058a', 'gallery', 2, NOW(), NOW()),
('319658ab-a05d-5f56-2c7d-e2c62f2644f9', 'b997d961-b22b-6126-7a77-8dd648c02b76', '5e5fe220-cd26-df3c-4ba1-8d9245771f6f', 'gallery', 3, NOW(), NOW()),
('5cd3c037-b796-fcb6-d5ee-80b0b9f2a57f', 'b997d961-b22b-6126-7a77-8dd648c02b76', '2a27ffd1-7b2a-d4d1-ad6f-2a09a53ec68f', 'gallery', 4, NOW(), NOW()),
('f42460d1-e199-6524-44b4-196953abb479', '007df7e6-512d-01ea-500d-bacabc612f59', 'bfeea951-3d07-ac46-e0b7-571b63263619', 'cover', 0, NOW(), NOW()),
('a4087af6-e3f6-25f0-4266-b420ca8169f4', '007df7e6-512d-01ea-500d-bacabc612f59', '4613f3dd-29dc-fb75-ab5e-af1315d8dd28', 'gallery', 1, NOW(), NOW()),
('a08a8497-fbb4-2ac9-bfe5-f3411cab941e', '007df7e6-512d-01ea-500d-bacabc612f59', 'ca717a1e-d011-9f10-25a8-398d22f194bd', 'gallery', 2, NOW(), NOW()),
('2b336022-29ea-aa24-961a-8c5735c14f03', '007df7e6-512d-01ea-500d-bacabc612f59', '9ccd154d-fd7e-5fe1-ec92-ca706e515fc8', 'gallery', 3, NOW(), NOW()),
('218a5f6c-b973-23eb-cc1e-da5dceb77854', '007df7e6-512d-01ea-500d-bacabc612f59', '5b991169-a831-22eb-9842-28596884cd34', 'gallery', 4, NOW(), NOW()),
('64841358-99aa-b121-8225-64e90f26334d', 'e3cabbf6-46ca-ebe7-52c9-7dd9c0c9bf2c', 'b37c29f1-a876-c685-f2b7-e8900bffeda1', 'cover', 0, NOW(), NOW()),
('6076190b-73d4-4a81-6a54-3656b9ad94e7', 'e3cabbf6-46ca-ebe7-52c9-7dd9c0c9bf2c', '6e9712be-8bea-118b-3f90-ed4c409097ba', 'gallery', 1, NOW(), NOW()),
('7314f8e7-158a-df45-38be-68fb8bf94ca3', '88bfd9a8-dd50-e098-471f-d7c55c830f5e', 'e72fd49e-2041-912b-e222-e3002ef97557', 'cover', 0, NOW(), NOW()),
('6eac4d65-2f79-c89c-e20c-ab233d5ebbc3', '88bfd9a8-dd50-e098-471f-d7c55c830f5e', 'ee83d8e0-6c5d-373f-3bdf-6302c03e5660', 'gallery', 1, NOW(), NOW()),
('478b9929-d540-ac37-b244-eccfd9e59dbd', '88bfd9a8-dd50-e098-471f-d7c55c830f5e', '6b5b149e-d43f-8de6-8d0e-d90e2ef56d65', 'gallery', 2, NOW(), NOW()),
('1e41c87f-f5b8-790c-f434-8a074579ee9e', '436eef20-203d-83bf-cf5b-2eb0d5061b69', 'f0c7885d-d8ad-c20f-51cc-c45e23f2037c', 'cover', 0, NOW(), NOW()),
('aee8d140-aa30-d21e-83f5-7b39849fb916', '436eef20-203d-83bf-cf5b-2eb0d5061b69', '9b88ee55-b25f-e50e-ec33-75e2e54f32cc', 'gallery', 1, NOW(), NOW()),
('33a403bb-4d64-45df-aad2-9819f8df0691', '436eef20-203d-83bf-cf5b-2eb0d5061b69', '92ed362c-426b-7649-dcba-2455159d2b36', 'gallery', 2, NOW(), NOW()),
('cda8f820-3997-609c-4ab1-54afcbba0fd6', '436eef20-203d-83bf-cf5b-2eb0d5061b69', '239efec3-af53-d471-42f2-9fbdbf0a9154', 'gallery', 3, NOW(), NOW()),
('7497d61a-b09d-288b-51f8-713542e39c36', '436eef20-203d-83bf-cf5b-2eb0d5061b69', 'ef0ea003-e8cb-b20e-1e21-75b8c24cd01a', 'gallery', 4, NOW(), NOW()),
('c6fb4c5f-6752-66a3-a5a8-b382636ae9fa', '6348c29a-41f8-1567-2ce8-0484d6d7cab2', '509b5904-1f36-bdd4-4040-7fcb2ed7512c', 'cover', 0, NOW(), NOW()),
('3ba76491-ae86-4253-2ac0-a47f13a7fe0b', '6348c29a-41f8-1567-2ce8-0484d6d7cab2', '64b7e0d5-712e-a2ce-34b0-8ce5c1cf0868', 'gallery', 1, NOW(), NOW()),
('509937c0-ca3c-fd6c-d29b-f92635e473c0', '6348c29a-41f8-1567-2ce8-0484d6d7cab2', '5ff0be7a-ddb2-5102-ab28-b10d6573c920', 'gallery', 2, NOW(), NOW()),
('059254ca-8189-e26f-ecb1-aa8841291463', 'e9d0f34f-0608-43be-31c9-3089a61f50c9', '41b9112d-cd06-a055-ee5a-9e96b7d63d9a', 'cover', 0, NOW(), NOW()),
('5fbbf24d-5f3d-47b7-812a-2f034b7a3ed1', 'f3473f35-2d1d-4546-96e2-a65b1c9b0c0a', '52f2ff8d-4da4-40b0-8f2d-2110dfb4c9be', 'cover', 0, NOW(), NOW()),
('6c8fef01-4b1a-4bca-9258-173f6ffb4218', 'f3473f35-2d1d-4546-96e2-a65b1c9b0c0a', '8c7d7fcc-dc57-4b7a-9bd4-6a5b6d4b4ec3', 'gallery', 1, NOW(), NOW()),
('7b0a83f5-0d46-4bec-bb2a-8f7a3df4b2d2', 'f3473f35-2d1d-4546-96e2-a65b1c9b0c0a', 'c2b93f7f-8764-4dc1-ae2f-1af0de2ff621', 'gallery', 2, NOW(), NOW()),
('8aadaee1-4435-458f-bf59-5168a7eb1373', 'f3473f35-2d1d-4546-96e2-a65b1c9b0c0a', 'd7ab12c6-8e6b-4c2f-8c89-936f7c34b02', 'gallery', 3, NOW(), NOW());

-- Insertion du log de disponibilité initial pour le site owner
INSERT INTO "AvailabilityLog" (id, "personId", status, "createdAt") VALUES
('b7c4dce9-df5e-406e-8550-faef8ba52e9b', '62cded6b-b881-d682-d8be-815775b7b164', 'unavailable', NOW());

COMMIT;

-- Statistiques: 4 articles, 8 projets, 8 tags, 32 médias, 1 log de disponibilité
