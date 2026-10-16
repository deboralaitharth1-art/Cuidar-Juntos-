import { FirstAidItem } from '../types';

export const FIRST_AID_ITEMS: FirstAidItem[] = [
  {
    id: 'engasgo',
    titulo: 'Engasgo e Sufocamento',
    icone: '🍽️',
    categoria: 'respiratorio',
    urgencia: 'imediata',
    resumo: 'Vítima não consegue falar, tossir ou respirar, e coloca as mãos no pescoço (sinal universal de asfixia).',
    passos: [
      {
        numero: 1,
        titulo: 'Verificar se tosse',
        descricao: 'Se a pessoa estiver tossindo com força ou falando, incentive-a a continuar tossindo. Não bata nas costas enquanto ela ainda consegue tossir sozinha.',
      },
      {
        numero: 2,
        titulo: 'Tapas interscapulares (5 golpes)',
        descricao: 'Se ela não consegue tossir nem falar: posicione-se ligeiramente ao lado e atrás, incline a pessoa para a frente apoiando o peito com uma mão e aplique 5 tapas secos e firmes no meio das costas (entre as escápulas) usando o calcanhar da mão.',
      },
      {
        numero: 3,
        titulo: 'Manobra de Heimlich (5 compressões abdominais)',
        descricao: 'Fique atrás da pessoa. Abrace a cintura dela. Feche uma mão com o polegar para dentro e posicione-a dois dedos acima do umbigo (longe das costelas). Segure esse punho com a outra mão e puxe rápido e firme para dentro e para cima (movimento em "J").',
        detalhe: 'Repita até desengasgar ou até a pessoa desmaiar.'
      },
      {
        numero: 4,
        titulo: 'Se a pessoa desmaiar / perder a consciência',
        descricao: 'Deite-a cuidadosamente de costas no chão. Ligue imediatamente para o SAMU 192 e inicie compressões no peito (RCP - 30 compressões no centro do peito). Só retire o objeto se ele estiver visível na boca.',
      }
    ],
    fazer: [
      'Incentivar a tosse se a pessoa conseguir emitir sons',
      'Realizar a Manobra de Heimlich com compressão rápida para dentro e para cima',
      'Em pessoas acamadas: apoie o tronco elevado ou lateralize a cabeça para não engolir o vômito',
      'Ligar para o SAMU 192 imediatamente se não resolver nos primeiros ciclos'
    ],
    naoFazer: [
      'NUNCA dê água, leite ou comida para quem está engasgado',
      'NUNCA enfie o dedo às cegas na garganta (isso pode empurrar o objeto mais para o fundo)',
      'Não perca tempo esperando: a falta de ar pode causar desmaio em poucos minutos'
    ],
    quandoLigar192: 'Ligue IMEDIATAMENTE (192) se o engasgo for total (sem voz, lábios roxos), se a pessoa desmaiar ou se não expelir o objeto após o primeiro ciclo de manobras.',
    fonte: {
      instituicao: 'Ministério da Saúde do Brasil & American Heart Association (AHA)',
      documento: 'Protocolo de Suporte Básico de Vida (SBV) para Obstrução de Vias Aéreas por Corpo Estranho (OVACE)',
      detalhe: 'Diretrizes Oficiais de Ressuscitação Cardiopulmonar e Cuidados de Emergência Cardiovascular'
    }
  },
  {
    id: 'sangramento',
    titulo: 'Corte e Sangramento Intenso',
    icone: '🩸',
    categoria: 'trauma',
    urgencia: 'alta',
    resumo: 'Ferimentos que sangram de forma contínua ou em jato através de cortes ou lacerações.',
    passos: [
      {
        numero: 1,
        titulo: 'Pressão direta imediata',
        descricao: 'Coloque um pano limpo, toalha ou gaze diretamente sobre o ferimento e aperte firmemente com a palma da mão sem interromper por pelo menos 10 a 15 minutos.',
      },
      {
        numero: 2,
        titulo: 'Elevar o membro ferido',
        descricao: 'Se o corte for no braço ou na perna (e não houver suspeita de fratura), eleve o membro acima do nível do coração para reduzir o fluxo sanguíneo local.',
      },
      {
        numero: 3,
        titulo: 'Nunca retire o primeiro pano',
        descricao: 'Se o pano encharcar de sangue, NÃO o retire (para não desfazer o coágulo formado). Coloque outro pano limpo por cima e continue pressionando firme.',
      },
      {
        numero: 4,
        titulo: 'Fixar com faixa ou atadura',
        descricao: 'Quando o sangramento diminuir, enfaixe o local sem prender a circulação dos dedos (verifique se os dedos continuam quentes e rosados).',
      }
    ],
    fazer: [
      'Pressionar de forma contínua com pano limpo e firme',
      'Manter o paciente sentado ou deitado em repouso calmo',
      'Lavar ferimentos leves superficiais com água corrente e sabão neutro',
      'Verificar a vacina antitetânica se o corte foi por metal enferrujado ou sujeira'
    ],
    naoFazer: [
      'NUNCA coloque pó de café, açúcar, ervas, pomadas caseiras ou teia de aranha',
      'NUNCA remova facas, vidros ou pregos cravados no corpo (estabilize o objeto com panos ao redor e chame o resgate)',
      'NUNCA faça torniquetes caseiros improvisados com arames ou tiras finas sem treinamento'
    ],
    quandoLigar192: 'Ligue para o SAMU 192 ou vá à UPA se o sangue jorrar em pulsações, se não parar após 10 minutos de pressão firme, ou se houver palidez intensa e tontura.',
    fonte: {
      instituicao: 'Cruz Vermelha Brasileira & Colégio Brasileiro de Cirurgiões (CBC)',
      documento: 'Diretrizes Internacionais de Primeiros Socorros e Controle de Hemorragias Externas',
      detalhe: 'Normas IFRC (Federação Internacional das Sociedades da Cruz Vermelha)'
    }
  },
  {
    id: 'queimadura',
    titulo: 'Queimaduras Térmicas e Líquidos Quentes',
    icone: '🔥',
    categoria: 'trauma',
    urgencia: 'alta',
    resumo: 'Lesões por água fervente, óleo, ferro de passar, vapor, fogo ou contato com superfícies quentes.',
    passos: [
      {
        numero: 1,
        titulo: 'Resfriar em água corrente fria (15 a 20 min)',
        descricao: 'Coloque a área queimada imediatamente sob água fria da torneira ou chuveiro (não gelada) por 15 a 20 minutos. Isso alivia a dor e impede que a queimadura continue aprofundando nos tecidos.',
      },
      {
        numero: 2,
        titulo: 'Retirar acessórios com cuidado',
        descricao: 'Retire anéis, pulseiras, relógios e roupas soltas perto da queimadura ANTES que a região comece a inchar.',
      },
      {
        numero: 3,
        titulo: 'Não puxar roupas grudadas',
        descricao: 'Se a roupa estiver colada na pele queimada, corte o tecido ao redor com tesoura, mas NÃO arranque a parte grudada.',
      },
      {
        numero: 4,
        titulo: 'Cobrir com pano úmido limpo',
        descricao: 'Proteja a lesão cobrindo-a suavemente com um pano limpo úmido ou plástico filme PVC transparente (sem apertar). Isso evita infecções e o contato com o ar.',
      }
    ],
    fazer: [
      'Usar apenas água limpa corrente em abundância',
      'Cobrir suavemente com tecido limpo ou filme plástico esterilizado',
      'Manter a pessoa aquecida com cobertor nas partes não afetadas'
    ],
    naoFazer: [
      'NUNCA passe manteiga, pasta de dente, óleo, clara de ovo ou borra de café',
      'NUNCA coloque gelo diretamente sobre a queimadura (o gelo queima os tecidos)',
      'NUNCA estoure as bolhas que se formarem (a bolha é o curativo natural do corpo)'
    ],
    quandoLigar192: 'Ligue para o SAMU 192 ou vá à emergência se a queimadura for maior que a palma da mão, se atingir o rosto, olhos, mãos, pés ou genitais, ou se for causada por eletricidade ou produtos químicos.',
    fonte: {
      instituicao: 'Sociedade Brasileira de Queimaduras (SBQ) & Ministério da Saúde',
      documento: 'Cartilha de Orientação de Primeiros Socorros em Queimaduras',
      detalhe: 'Protocolo Nacional de Atendimento Pré-Hospitalar ao Paciente Queimado'
    }
  },
  {
    id: 'desmaio',
    titulo: 'Desmaio e Perda Súbita de Sentidos',
    icone: '😵',
    categoria: 'neurologico',
    urgencia: 'alta',
    resumo: 'Perda temporária da consciência por queda repentina da pressão arterial, calor ou jejum.',
    passos: [
      {
        numero: 1,
        titulo: 'Garantir segurança e deitar a pessoa',
        descricao: 'Deite a pessoa confortavelmente de costas no chão para evitar quedas e machucados. Verifique se ela está respirando normalmente.',
      },
      {
        numero: 2,
        titulo: 'Elevar as pernas a 30 cm do chão',
        descricao: 'Levante as pernas da pessoa (cerca de 30 centímetros acima do nível do tronco), apoiando-as em almofadas ou em uma cadeira. Isso faz o sangue voltar mais rápido ao cérebro.',
      },
      {
        numero: 3,
        titulo: 'Afrouxar roupas e ventilar',
        descricao: 'Abra botões de camisas apertadas, cintos e golas. Mantenha o ambiente bem arejado e afaste curiosos.',
      },
      {
        numero: 4,
        titulo: 'Ao acordar: NÃO levante rápido',
        descricao: 'Quando acordar, a pessoa deve ficar deitada por pelo menos 5 minutos, depois sentar devagar com as pernas para fora da cama por mais 5 minutos antes de ficar em pé.',
      }
    ],
    fazer: [
      'Elevar as pernas da pessoa enquanto ela estiver deitada',
      'Virar a pessoa de lado (posição lateral de segurança) se ela vomitar ou se demorar a despertar',
      'Oferecer água SOMENTE após a pessoa estar 100% acordada e sentada'
    ],
    naoFazer: [
      'NUNCA dê líquidos ou alimentos enquanto ela estiver desacordada ou sonolenta (risco de asfixia fatal)',
      'NUNCA jogue água no rosto nem faça a pessoa cheirar álcool ou vinagre',
      'NUNCA a force a levantar imediatamente após abrir os olhos'
    ],
    quandoLigar192: 'Ligue 192 se a pessoa demorar mais de 1 minuto para recobrar a consciência, se bateu a cabeça com força na queda, se tiver dor no peito, ou se acordar com fraqueza em um dos lados do corpo.',
    fonte: {
      instituicao: 'Sociedade Brasileira de Cardiologia (SBC)',
      documento: 'Diretriz de Avaliação e Tratamento de Pacientes com Síncope e Pré-Síncope',
      detalhe: 'Arquivos Brasileiros de Cardiologia (Normas de Manejo Inicial da Síncope Vasovagal)'
    }
  },
  {
    id: 'avc',
    titulo: 'Suspeita de AVC / Derrame Cerebral',
    icone: '🧠',
    categoria: 'neurologico',
    urgencia: 'imediata',
    resumo: 'Cada minuto conta! O tratamento hospitalar nas primeiras horas reduz sequelas graves e salva vidas.',
    passos: [
      {
        numero: 1,
        titulo: 'S — Sorriso',
        descricao: 'Peça para a pessoa dar um sorriso aberto. Observe se um dos lados da boca está caído ou torto.',
      },
      {
        numero: 2,
        titulo: 'A — Abraço',
        descricao: 'Peça para levantar os dois braços como se fosse dar um abraço. Observe se um dos braços cai ou perde a força.',
      },
      {
        numero: 3,
        titulo: 'M — Música ou Frase',
        descricao: 'Peça para a pessoa repetir uma frase simples ou cantar um trecho de música. Observe se a fala está enrolada, arrastada ou sem sentido.',
      },
      {
        numero: 4,
        titulo: 'U — Urgência imediata!',
        descricao: 'Se QUALQUER um desses três testes der alterado, ligue imediatamente para o SAMU 192. Anote exatamente o horário em que os sintomas começaram!',
      }
    ],
    fazer: [
      'Chamar o SAMU 192 imediatamente informando "suspeita de AVC"',
      'Anotar o horário exato em que a pessoa foi vista normal pela última vez',
      'Manter o paciente em repouso com a cabeça levemente elevada (30 graus)'
    ],
    naoFazer: [
      'NUNCA dê remédio para baixar a pressão sem ordem médica expressa (a pressão alta é uma reação do cérebro)',
      'NUNCA dê alimentos, água ou AAS (aspirina) antes de uma tomografia no hospital',
      'NUNCA deixe a pessoa "dormir para ver se passa"'
    ],
    quandoLigar192: 'Ligue IMEDIATAMENTE ao menor sinal de boca torta, perda de força no braço/perna, perda de visão ou fala enrolada.',
    fonte: {
      instituicao: 'Rede Brasil AVC & Ministério da Saúde',
      documento: 'Linha de Cuidado do Acidente Vascular Cerebral no Adulto / Escala de Cincinnati (SAMU)',
      detalhe: 'Portaria SAS/MS nº 664 e Diretrizes da World Stroke Organization (WSO)'
    }
  },
  {
    id: 'convulsao',
    titulo: 'Convulsão e Crise Epiléptica',
    icone: '⚡',
    categoria: 'neurologico',
    urgencia: 'imediata',
    resumo: 'A pessoa perde a consciência, cai, contrai o corpo e se debate involuntariamente, podendo salivar ou morder os lábios.',
    passos: [
      {
        numero: 1,
        titulo: 'Proteger a cabeça',
        descricao: 'Abaixe-se junto à pessoa e coloque algo macio (travesseiro, toalha dobrada ou sua própria mão) sob a cabeça dela para evitar traumatismo craniano.',
      },
      {
        numero: 2,
        titulo: 'Afastar objetos perigosos',
        descricao: 'Afaste móveis, vidros, objetos pontiagudos ou quentes de perto do corpo.',
      },
      {
        numero: 3,
        titulo: 'Cronometrar a duração',
        descricao: 'Olhe no relógio o horário exato em que a crise começou. A maioria das crises dura menos de 2 a 3 minutos.',
      },
      {
        numero: 4,
        titulo: 'Após a crise: virar de lado',
        descricao: 'Assim que os tremores cessarem, vire a pessoa cuidadosamente de lado (posição lateral de segurança) para que a saliva e vômito escorram livremente e não impeçam a respiração.',
      }
    ],
    fazer: [
      'Proteger a cabeça contra choques no chão duro',
      'Afrouxar golas e roupas apertadas no pescoço',
      'Permanecer calmo ao lado da pessoa até ela recuperar a consciência'
    ],
    naoFazer: [
      'NUNCA tente segurar a língua da pessoa nem enfie nada na boca (dedos, colher, panos)',
      'NUNCA tente conter os movimentos à força ou segurar os braços e pernas com violência',
      'NUNCA dê água ou remédio enquanto ela estiver desacordada ou confusa'
    ],
    quandoLigar192: 'Ligue 192 se a crise durar mais de 3 minutos, se houver crises repetidas sem ela acordar, se for a primeira crise da vida, se a pessoa estiver grávida ou se ela se ferir na queda.',
    fonte: {
      instituicao: 'Liga Brasileira de Epilepsia (LBE) & Associação Brasileira de Epilepsia (ABE)',
      documento: 'Guia de Condutas em Primeiros Socorros nas Crises Epilépticas',
      detalhe: 'Protocolo Clínico de Manejo Pré-Hospitalar de Crises Convulsivas'
    }
  },
  {
    id: 'queda_idoso',
    titulo: 'Quedas em Idosos e Traumas',
    icone: '🦴',
    categoria: 'trauma',
    urgencia: 'alta',
    resumo: 'Quedas são as principais causas de fratura de fêmur e hematomas cranianos em pessoas idosas.',
    passos: [
      {
        numero: 1,
        titulo: 'Não levantar a pessoa com pressa',
        descricao: 'Aproxime-se com calma e acalme o idoso. Peça para ele não se mexer enquanto você avalia a situação.',
      },
      {
        numero: 2,
        titulo: 'Verificar onde dói',
        descricao: 'Pergunte onde dói. Observe pernas e braços: se uma das pernas estiver mais curta ou com o pé virado para fora com dor intensa na virilha/quadril, suspeite de fratura de fêmur.',
      },
      {
        numero: 3,
        titulo: 'Verificar a cabeça',
        descricao: 'Examine se há cortes ou inchaço no couro cabeludo. Pergunte se a pessoa sabe onde está e que dia é hoje.',
      },
      {
        numero: 4,
        titulo: 'Como levantar com segurança (se NÃO houver fratura)',
        descricao: 'Se não houver dor intensa nem fratura: role o idoso para o lado, ajude-o a ficar de quatro apoios, aproxime uma cadeira firme para ele apoiar as mãos, ajoelhar e finalmente sentar.',
      }
    ],
    fazer: [
      'Manter o idoso aquecido com um cobertor no chão enquanto avalia',
      'Imobilizar a perna dolorida com apoios laterais se suspeitar de fratura',
      'Comunicar sempre à equipe da UBS após qualquer queda para investigar a causa (tontura, remédio, visão)'
    ],
    naoFazer: [
      'NUNCA puxe a pessoa pelos braços para levantá-la de uma vez (risco de luxação de ombro e dor aguda)',
      'NUNCA massageie regiões com suspeita de osso quebrado',
      'Não desvalorize pequenas batidas na cabeça (em idosos que usam anticoagulantes pode haver sangramento lento)'
    ],
    quandoLigar192: 'Ligue 192 se o idoso não conseguir mexer a perna, se a perna estiver torta/virada, se bateu a cabeça com perda de memória/sonolência, ou se estiver gemendo de dor intensa.',
    fonte: {
      instituicao: 'Sociedade Brasileira de Geriatria e Gerontologia (SBGG) & Ministério da Saúde',
      documento: 'Cadernos de Atenção Básica nº 19 — Envelhecimento e Saúde da Pessoa Idosa',
      detalhe: 'Diretrizes Clínicas de Prevenção e Atendimento Inicial a Quedas e Fraturas'
    }
  },
  {
    id: 'febre',
    titulo: 'Febre Alta e Calafrios',
    icone: '🤒',
    categoria: 'clinico',
    urgencia: 'moderada',
    resumo: 'Temperatura acima de 37,8°C (axilar). Em idosos, a febre pode ser mais sutil ou se manifestar como sonolência e confusão.',
    passos: [
      {
        numero: 1,
        titulo: 'Medir com termômetro',
        descricao: 'Seque a axila com papel toalha e posicione o bulbo do termômetro bem no centro da axila, mantendo o braço encostado no peito até apitar.',
      },
      {
        numero: 2,
        titulo: 'Roupas leves e ambiente fresco',
        descricao: 'Retire agasalhos pesados e cobertores grossos. Deixe a pessoa com roupas confortáveis de algodão em quarto ventilado.',
      },
      {
        numero: 3,
        titulo: 'Oferecer líquidos com frequência',
        descricao: 'Ofereça água filtrada, chás claros ou água de coco em pequenos goles a cada 15 a 30 minutos para evitar desidratação.',
      },
      {
        numero: 4,
        titulo: 'Compressas com água morna',
        descricao: 'Se a febre for muito alta, coloque toalhas umedecidas em água morna (nunca fria) na testa, pescoço e axilas.',
      }
    ],
    fazer: [
      'Administrar o antitérmico receitado pelo médico (como Paracetamol ou Dipirona) nas doses e intervalos corretos',
      'Registrar os horários e valores da temperatura para mostrar ao médico',
      'Monitorar a cor da urina (urina escura é sinal de pouca água)'
    ],
    naoFazer: [
      'NUNCA dê banho com água gelada (isso provoca calafrios fortes e choque térmico)',
      'NUNCA passe álcool no corpo da pessoa (o álcool é tóxico e pode ser absorvido pela pele)',
      'NUNCA dobre a dose do remédio por conta própria se a febre demorar para baixar'
    ],
    quandoLigar192: 'Procure atendimento de urgência se a febre vier acompanhada de rigidez na nuca (dor forte ao dobrar o queixo no peito), manchas vermelhas na pele, falta de ar ou confusão mental aguda.',
    fonte: {
      instituicao: 'Ministério da Saúde do Brasil & Sociedade Brasileira de Clínica Médica (SBCM)',
      documento: 'Protocolos de Manejo Clínico da Síndrome Febril e Termorregulação no Adulto e Idoso',
      detalhe: 'Atenção Básica e Urgência no Sistema Único de Saúde (SUS)'
    }
  },
  {
    id: 'hipoglicemia',
    titulo: 'Queda de Glicose (Hipoglicemia)',
    icone: '🍬',
    categoria: 'clinico',
    urgencia: 'alta',
    resumo: 'Glicemia abaixo de 70 mg/dL em quem tem diabetes. Sintomas: suor frio, palidez, tremor nas mãos, fome súbita e visão turva.',
    passos: [
      {
        numero: 1,
        titulo: 'Se o paciente estiver CONSCIENTE',
        descricao: 'Dê imediatamente 15g de carboidrato de ação rápida: 1 copo (150 ml) de água com 1 colher de sopa de açúcar, ou meio copo de refrigerante comum (não diet), ou 150ml de suco de laranja natural adoçado.',
      },
      {
        numero: 2,
        titulo: 'Aguardar 15 minutos em repouso',
        descricao: 'Deixe a pessoa sentada descansando por 15 minutos e meça a glicemia novamente no glicosímetro.',
      },
      {
        numero: 3,
        titulo: 'Reforço alimentar leve',
        descricao: 'Assim que a glicemia passar de 70 mg/dL e a pessoa melhorar, ofereça um lanche leve (uma torrada, bolacha ou refeição habitual) para a taxa não despencar de novo.',
      },
      {
        numero: 4,
        titulo: 'Se o paciente estiver DESACORDADO ou convulsionando',
        descricao: 'NÃO coloque nada na boca! Ligue imediatamente para o SAMU 192 e lateralize o corpo para proteger as vias aéreas.',
      }
    ],
    fazer: [
      'Agir rápido: hipoglicemia é mais perigosa no curto prazo do que glicose alta',
      'Ter sempre sachês de açúcar ou balas à mão em passeios',
      'Informar a UBS ou médico para rever a dose de insulina ou remédios'
    ],
    naoFazer: [
      'NUNCA tente dar líquidos doces para quem está desmaiado ou quase dormindo (risco de afogamento nos pulmões)',
      'NUNCA use chocolates gordurosos no socorro imediato (a gordura atrasa a absorção do açúcar)',
      'NUNCA aplique mais insulina quando os sintomas forem de tremor e suor frio'
    ],
    quandoLigar192: 'Ligue 192 se a pessoa perder a consciência, convulsionar, ou se a glicemia continuar abaixo de 70 mg/dL após duas tentativas de reposição de açúcar.',
    fonte: {
      instituicao: 'Sociedade Brasileira de Diabetes (SBD)',
      documento: 'Diretrizes Oficiais da Sociedade Brasileira de Diabetes — Regra dos 15g para Hipoglicemia',
      detalhe: 'Condutas em Hipoglicemia em Pacientes com Diabetes Tipo 1 e Tipo 2'
    }
  }
];
