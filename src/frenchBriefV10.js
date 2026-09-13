const put = (target, value) => {
  if (!target) return
  target.fr = target.fr || value
}

const FR_GLOBAL = {
  title: 'Plan standard',
  sections: {
    start: 'Lever la tête et jouer simple.\nSe déplacer après la passe ; le milieu doit toujours être disponible.',
    attack: "Les ailiers restent larges et utilisent les espaces libres.\nL'attaquant prend la profondeur ; après récupération, chercher rapidement une passe vers l'avant.",
    defend: 'Revenir vite, marquer un adversaire et communiquer.\nLe joueur le plus proche presse ; les autres ferment les lignes de passe et les espaces.',
    transition: 'À la perte : réagir immédiatement pendant 5 secondes.\nÀ la récupération : lever la tête, chercher vers l’avant et utiliser les ailes.',
    mindset: 'Croire que tu peux le faire.\nPlus tu crois en toi, mieux tu joueras.',
  },
}

const FR_ROLES = {
  goalkeeper: {
    role: 'Gardien',
    possession: "Jouer court au pied quand c'est possible.\nSous pression, se dégager proprement et loin du danger.",
    defence: 'Protéger les cages et lire le jeu tôt.\nDiriger et replacer sa défense.',
    transition: 'Sur ballon en retrait ou avec une ligne haute, relancer vite pour éloigner le danger.\nAnticiper et réagir rapidement.',
    cue: 'Être décisif, communiquer et organiser.',
  },
  leftFullBack: {
    role: 'Arrière latéral gauche',
    possession: 'Participer à la relance.\nMonter dans le couloir pour créer le surnombre et centrer.',
    defence: 'Fermer le couloir et empêcher les centres.\nProtéger d’abord l’intérieur.',
    transition: 'Revenir vite, puis offrir une solution large à la récupération.',
    cue: 'Soutenir l’attaque sans laisser le couloir ouvert.',
  },
  rightFullBack: {
    role: 'Arrière latéral droit',
    possession: 'Participer à la relance.\nMonter dans le couloir pour créer le surnombre et centrer.',
    defence: 'Fermer le couloir et empêcher les centres.\nProtéger d’abord l’intérieur.',
    transition: 'Revenir vite, puis offrir une solution large à la récupération.',
    cue: 'Soutenir l’attaque sans laisser le couloir ouvert.',
  },
  stopper: {
    role: 'Défenseur central stoppeur',
    possession: 'Après récupération, relancer proprement.\nChercher une passe sûre vers l’avant.',
    defence: 'Assurer la couverture et marquer l’attaquant de pointe.\nCouper l’axe et orienter le jeu vers les côtés.',
    transition: 'Anticiper tôt et intercepter avant que le danger augmente.',
    cue: 'Protéger l’axe en priorité.',
  },
  leftDefMid: {
    role: 'Milieu défensif gauche',
    possession: 'Recevoir les ballons de la défense et relier le jeu.\nÉlargir le jeu et jouer sur les côtés ou verticalement.',
    defence: 'Couvrir l’axe et les côtés.\nCouper les lignes de passe et protéger la défense.',
    transition: 'Assurer la transition défense-attaque et réagir vite sur les deuxièmes ballons.',
    cue: 'Stabiliser le bloc équipe.',
  },
  rightDefMid: {
    role: 'Milieu défensif droit',
    possession: 'Recevoir les ballons de la défense et relier le jeu.\nÉlargir le jeu et jouer sur les côtés ou verticalement.',
    defence: 'Couvrir l’axe et les côtés.\nCouper les lignes de passe et protéger la défense.',
    transition: 'Assurer la transition défense-attaque et réagir vite sur les deuxièmes ballons.',
    cue: 'Stabiliser le bloc équipe.',
  },
  centralMid: {
    role: 'Milieu central',
    possession: 'Créer et orienter le jeu avec peu de touches.\nJouer court sous pression ; changer de côté ou jouer en profondeur quand l’espace s’ouvre.',
    defence: 'Couvrir l’axe et aider à fermer les couloirs.\nSoutenir la défense sous pression.',
    transition: 'Trouver rapidement l’espace et chercher la passe décisive.',
    cue: 'Scanner avant de recevoir et rester disponible.',
  },
  leftWinger: {
    role: 'Ailier gauche',
    possession: 'Soutenir l’avant-centre et attaquer le couloir.\nFaire des courses diagonales et jouer dans la profondeur.',
    defence: 'Être parmi les premiers à défendre.\nPresser la relance adverse et bloquer la sortie côté.',
    transition: 'Partir vite en contre et jouer le deuxième ballon autour de l’attaquant.',
    cue: 'Protéger son côté et soutenir l’attaquant.',
  },
  rightWinger: {
    role: 'Ailier droit',
    possession: 'Soutenir l’avant-centre et attaquer le couloir.\nFaire des courses diagonales et jouer dans la profondeur.',
    defence: 'Être parmi les premiers à défendre.\nPresser la relance adverse et bloquer la sortie côté.',
    transition: 'Partir vite en contre et jouer le deuxième ballon autour de l’attaquant.',
    cue: 'Protéger son côté et soutenir l’attaquant.',
  },
  striker: {
    role: 'Avant-centre',
    possession: 'Être décisif devant le but.\nMaîtriser le timing des appels ; attaquer verticalement ou en diagonale.',
    defence: 'Déclencher le pressing et rendre la première passe adverse difficile.',
    transition: 'Accélérer dans l’espace à la récupération.\nLire où le ballon va arriver.',
    cue: 'Marquer des buts et anticiper les défenseurs.',
  },
}

const ROLE_MAP = {
  '7v7': {
    1: 'goalkeeper',
    2: 'leftFullBack',
    3: 'rightFullBack',
    4: 'centralMid',
    5: 'leftWinger',
    6: 'rightWinger',
    7: 'striker',
  },
  '9v9': {
    1: 'goalkeeper',
    2: 'leftFullBack',
    3: 'stopper',
    4: 'rightFullBack',
    5: 'leftDefMid',
    6: 'rightDefMid',
    7: 'leftWinger',
    8: 'striker',
    9: 'rightWinger',
  },
}

export function ensureFrenchStandard(plan, formation) {
  if (!plan) return plan

  put(plan.global?.title, FR_GLOBAL.title)
  for (const section of plan.global?.sections || []) {
    put(section.label, {
      start: 'Avec le ballon',
      attack: 'Largeur et soutien',
      defend: 'Sans le ballon',
      transition: 'Transitions',
      mindset: 'Mentalité',
    }[section.key] || section.label?.en || '')
    put(section.text, FR_GLOBAL.sections[section.key] || section.text?.en || '')
  }

  const roleMap = ROLE_MAP[formation] || {}
  for (const target of plan.players || []) {
    const brief = FR_ROLES[roleMap[target.number]]
    if (!brief) continue
    put(target.role, brief.role)
    for (const section of target.sections || []) {
      put(section.label, {
        possession: 'Avec le ballon',
        defence: 'Sans le ballon',
        transition: 'Transition',
        cue: 'Point clé',
      }[section.key] || section.label?.en || '')
      put(section.text, brief[section.key] || section.text?.en || '')
    }
  }

  return plan
}
