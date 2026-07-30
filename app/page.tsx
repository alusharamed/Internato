"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Activity, BookOpen, Calendar, CheckCircle, Clock, Flame,
  LayoutDashboard, Play, Trash2, TrendingUp,
  Stethoscope, Baby, Syringe, HeartPulse, Brain,
  LogOut, Loader2, CheckSquare, BarChart3,
  AlertTriangle, CalendarDays, CalendarCheck, Shuffle, Sparkles, ListChecks,
  Search, ChevronDown, ChevronLeft, ChevronRight, FileText, Award, RotateCcw, X
} from 'lucide-react';

// --- 1. CONFIGURAÇÃO DO SUPABASE ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- CORREÇÃO DE DATA (FUSO HORÁRIO LOCAL REAL) ---
const getLocalDate = (dateObj = new Date()) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const MOTIVATIONAL_QUOTES = [
  "A disciplina é a ponte entre metas e realizações.",
  "O R1 dos seus sonhos está te esperando do outro lado do cansaço.",
  "Medicina não é corrida de 100m, é maratona.",
  "Hoje melhor que ontem, amanhã melhor que hoje.",
  "Constância vence intensidade.",
  "Não pare até se orgulhar.",
  "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
  "Estudar é o privilégio de construir o próprio futuro.",
  "Se fosse fácil, todo mundo faria. Você escolheu o caminho dos fortes.",
  "O cansaço passa, a aprovação fica para sempre."
];

// --- SISTEMA DE PRIORIDADES ---
const PRIORITIES = {
  DIAMANTE: { label: 'Diamante (1º)', color: 'bg-cyan-400 text-white border border-cyan-500 font-bold shadow-[0_0_10px_rgba(34,211,238,0.4)]' },
  VERDE:    { label: 'Verde (2º)',    color: 'bg-lime-500 text-white border border-lime-600 font-bold shadow-[0_0_10px_rgba(132,204,22,0.4)]' },
  AMARELO:  { label: 'Amarelo (3º)',  color: 'bg-amber-400 text-black border border-amber-500 font-bold' },
  VERMELHO: { label: 'Vermelho (4º)', color: 'bg-red-500 text-white border border-red-600 font-bold' },
};

// --- ÁREAS ---
const AREAS = {
  CLINICA:    { id: 'clinica',    label: 'Clínica Médica',            icon: Activity,    color: '#fbbf24' },
  CIRURGIA:   { id: 'cirurgia',   label: 'Cirurgia Geral',            icon: Stethoscope, color: '#22d3ee' },
  PEDIATRIA:  { id: 'pediatria',  label: 'Pediatria',                 icon: Baby,        color: '#f472b6' },
  GO:         { id: 'go',         label: 'Ginecologia e Obstetrícia', icon: HeartPulse,  color: '#fb7185' },
  PREVENTIVA: { id: 'preventiva', label: 'Preventiva',                icon: Syringe,     color: '#34d399' },
  SIMULADO:   { id: 'simulado',   label: 'Simulado Geral',            icon: FileText,    color: '#a855f7' },
};

type AreaKey = keyof typeof AREAS;

type PriorityKey = keyof typeof PRIORITIES;

const getArea = (area: string) => AREAS[(area || '').toUpperCase() as AreaKey] || AREAS.SIMULADO;
const getPriority = (priority: string) => PRIORITIES[(priority || '').toUpperCase() as PriorityKey] || PRIORITIES.VERDE;

// --- LISTA COMPLETA DE CONTEÚDOS ---
// (mantenha exatamente o mesmo FULL_SUBJECTS_LIST que você já tem no seu arquivo atual,
//  só troque a linha de .map() no final por esta, removendo o campo "cards"):
//
// ].map(s => ({ ...s, watched: false, read: false, accuracy: 0, nextReview: null }));
//
// >>> COLE AQUI SEU ARRAY FULL_SUBJECTS_LIST COMPLETO (do id 101 até 2609) <<<
const FULL_SUBJECTS_LIST: any[] = [
    // BLOCO 1
  { id: 101, area: 'clinica', priority: 'VERDE', topic: 'Hematologia: Avaliação Global do Hemograma' },
  { id: 102, area: 'clinica', priority: 'DIAMANTE', topic: 'Hematologia: Anemias Hipoproliferativas I' },
  { id: 103, area: 'clinica', priority: 'VERDE', topic: 'Hematologia: Anemias Hipoproliferativas II' },
  { id: 104, area: 'go', priority: 'VERDE', topic: 'Obstetrícia: Modificações do Organismo Materno' },
  { id: 105, area: 'go', priority: 'DIAMANTE', topic: 'Obstetrícia: Assistência ao Pré-Natal' },
  { id: 106, area: 'go', priority: 'AMARELO', topic: 'Medicina Fetal: Ultrassonografia em Obstetrícia' },
  { id: 107, area: 'pediatria', priority: 'DIAMANTE', topic: 'Puericultura: Aleitamento Materno' },
  { id: 108, area: 'pediatria', priority: 'AMARELO', topic: 'Puericultura: Alimentação Infantil' },
  { id: 109, area: 'pediatria', priority: 'VERDE', topic: 'Puericultura: Desenvolvimento Infantil' },
  { id: 110, area: 'pediatria', priority: 'VERDE', topic: 'Neuro-Ped: Alterações no Neurodesenvolvimento - TEA e TDAH' },
  { id: 111, area: 'preventiva', priority: 'VERDE', topic: 'Boas Vindas à Preventiva' },
  { id: 112, area: 'preventiva', priority: 'VERDE', topic: 'Níveis de Prevenção' },
  { id: 113, area: 'preventiva', priority: 'DIAMANTE', topic: 'Epidemiologia: Indicadores de Saúde' },
  { id: 114, area: 'cirurgia', priority: 'VERDE', topic: 'Introdução ao Extensivo e Como Acertar Questões de Prova' },
  { id: 115, area: 'cirurgia', priority: 'DIAMANTE', topic: 'Trauma: Introdução e Atendimento Inicial' },
  { id: 116, area: 'cirurgia', priority: 'VERDE', topic: 'Trauma: Vias aéreas' },
  { id: 117, area: 'cirurgia', priority: 'VERDE', topic: 'Trauma: Choque e Ressuscitação Hemostática' },

  // BLOCO 2
  { id: 201, area: 'clinica', priority: 'DIAMANTE', topic: 'Neurologia: Neurovascular I (AIT e AVCi)' },
  { id: 202, area: 'clinica', priority: 'VERDE', topic: 'Neurologia: Neurovascular II (HSA e AVCh)' },
  { id: 203, area: 'go', priority: 'DIAMANTE', topic: 'Gineco: Anatomia Pélvica Feminina' },
  { id: 204, area: 'go', priority: 'AMARELO', topic: 'Gineco: Embriologia do Sistema Genital Feminino' },
  { id: 205, area: 'go', priority: 'AMARELO', topic: 'Gineco: Malformações Mullerianas' },
  { id: 206, area: 'pediatria', priority: 'AMARELO', topic: 'Emergências: Febre sem Sinais Localizatórios' },
  { id: 207, area: 'pediatria', priority: 'DIAMANTE', topic: 'Nefro-Ped: Síndrome Nefrítica, Nefrótica, SHU' },
  { id: 208, area: 'pediatria', priority: 'VERMELHO', topic: 'Nefro-Ped: Doença Renal Crônica e LRA' },
  { id: 209, area: 'pediatria', priority: 'AMARELO', topic: 'Nefro-Ped: Miscelânea' },
  { id: 210, area: 'preventiva', priority: 'DIAMANTE', topic: 'Epidemiologia: Testes Diagnósticos' },
  { id: 211, area: 'preventiva', priority: 'AMARELO', topic: 'APS: Assistência ao Pré-Natal' },
  { id: 212, area: 'cirurgia', priority: 'VERMELHO', topic: 'Trauma: Medidas Auxiliares e FAST' },
  { id: 213, area: 'cirurgia', priority: 'VERDE', topic: 'Trauma: Populações especiais' },
  { id: 214, area: 'cirurgia', priority: 'DIAMANTE', topic: 'Trauma de Tórax' },

  // BLOCO 3
  { id: 301, area: 'clinica', priority: 'DIAMANTE', topic: 'Infecto: Sífilis' },
  { id: 302, area: 'clinica', priority: 'VERDE', topic: 'Gastro: Dispepsia, DRGE e Barret' },
  { id: 303, area: 'clinica', priority: 'VERDE', topic: 'Gastro: Úlcera Péptica e H. pylori' },
  { id: 304, area: 'go', priority: 'DIAMANTE', topic: 'Gineco: Corrimentos Vaginais' },
  { id: 305, area: 'go', priority: 'VERDE', topic: 'Gineco: Doença Inflamatória Pélvica Aguda' },
  { id: 306, area: 'go', priority: 'VERDE', topic: 'Gineco: Úlceras Genitais' },
  { id: 307, area: 'pediatria', priority: 'DIAMANTE', topic: 'Gastro-Ped: Alergia Alimentar, Refluxo e Constipação' },
  { id: 308, area: 'pediatria', priority: 'AMARELO', topic: 'Gastro-Ped: Diarreia Crônica e Doenças Funcionais' },
  { id: 309, area: 'pediatria', priority: 'VERDE', topic: 'Violência Contra a Criança e o Adolescente' },
  { id: 310, area: 'preventiva', priority: 'DIAMANTE', topic: 'Saúde Coletiva: Determinação Social e Promoção' },
  { id: 311, area: 'cirurgia', priority: 'DIAMANTE', topic: 'Trauma Abdominal' },
  { id: 312, area: 'cirurgia', priority: 'AMARELO', topic: 'Urologia: Trauma Urológico' },

  // BLOCO 4
  { id: 401, area: 'clinica', priority: 'VERDE', topic: 'Reumato: Introdução às Artrites e Artrite Reumatoide' },
  { id: 402, area: 'clinica', priority: 'VERDE', topic: 'Reumato: Espondiloartrites' },
  { id: 403, area: 'clinica', priority: 'AMARELO', topic: 'Reumato: Artrites Microcristalinas (Gota e CPPD)' },
  { id: 404, area: 'clinica', priority: 'AMARELO', topic: 'Reumato: Osteoartrite' },
  { id: 405, area: 'clinica', priority: 'AMARELO', topic: 'Reumato: Fibromialgia' },
  { id: 406, area: 'go', priority: 'DIAMANTE', topic: 'Obstetrícia: Assistência ao Parto' },
  { id: 407, area: 'go', priority: 'VERDE', topic: 'Obstetrícia: Sofrimento Fetal Agudo' },
  { id: 408, area: 'pediatria', priority: 'DIAMANTE', topic: 'Puericultura: Crescimento e Baixa Estatura' },
  { id: 409, area: 'pediatria', priority: 'AMARELO', topic: 'Puericultura: Obesidade e Síndrome Metabólica' },
  { id: 410, area: 'pediatria', priority: 'VERDE', topic: 'Puericultura: Puberdade' },
  { id: 411, area: 'pediatria', priority: 'AMARELO', topic: 'Puericultura: Desnutrição e Vitaminas' },
  { id: 412, area: 'preventiva', priority: 'DIAMANTE', topic: 'Redes de Atenção à Saúde e Níveis de Atenção' },
  { id: 413, area: 'preventiva', priority: 'DIAMANTE', topic: 'Atenção Primária à Saúde' },
  { id: 414, area: 'cirurgia', priority: 'VERDE', topic: 'Trauma de Pelve' },
  { id: 415, area: 'cirurgia', priority: 'DIAMANTE', topic: 'Trauma Cranioencefálico' },
  { id: 416, area: 'cirurgia', priority: 'AMARELO', topic: 'Trauma Raquimedular' },
  { id: 417, area: 'cirurgia', priority: 'VERMELHO', topic: 'Trauma Musculoesquelético' },
  { id: 418, area: 'cirurgia', priority: 'VERMELHO', topic: 'Trauma de Pescoço' },

  // BLOCO 5
  { id: 501, area: 'clinica', priority: 'DIAMANTE', topic: 'Cardio: Dor Torácica Coronariana' },
  { id: 502, area: 'clinica', priority: 'AMARELO', topic: 'Cardio: Dor Torácica Não Coronariana' },
  { id: 503, area: 'go', priority: 'VERDE', topic: 'Gineco: Fisiologia Menstrual' },
  { id: 504, area: 'go', priority: 'DIAMANTE', topic: 'Gineco: Amenorreia Primária' },
  { id: 505, area: 'go', priority: 'AMARELO', topic: 'Gineco: Esteroidogênese' },
  { id: 506, area: 'pediatria', priority: 'VERMELHO', topic: 'Emergências: Politrauma e Afogamento' },
  { id: 507, area: 'pediatria', priority: 'VERMELHO', topic: 'Emergências: Queimaduras' },
  { id: 508, area: 'pediatria', priority: 'AMARELO', topic: 'Emergências: TCE e Hipertensão Intracraniana' },
  { id: 509, area: 'pediatria', priority: 'DIAMANTE', topic: 'Emergências: Diarreia Aguda' },
  { id: 510, area: 'preventiva', priority: 'DIAMANTE', topic: 'Epidemiologia: Classificação dos Estudos' },
  { id: 511, area: 'preventiva', priority: 'VERDE', topic: 'Epidemiologia: Associação x Causalidade' },
  { id: 512, area: 'preventiva', priority: 'VERDE', topic: 'APS: Rastreamentos' },
  { id: 513, area: 'cirurgia', priority: 'DIAMANTE', topic: 'Trauma: Encerramento' },
  { id: 514, area: 'cirurgia', priority: 'VERDE', topic: 'Plástica: Queimaduras' },
  { id: 515, area: 'cirurgia', priority: 'VERDE', topic: 'Urologia: Escroto Agudo' },
  { id: 516, area: 'cirurgia', priority: 'VERMELHO', topic: 'Urologia: Priapismo' },

  // BLOCO 6
  { id: 601, area: 'clinica', priority: 'VERDE', topic: 'Nefro: Gasometria Arterial' },
  { id: 602, area: 'clinica', priority: 'DIAMANTE', topic: 'Nefro: Distúrbios do Sódio' },
  { id: 603, area: 'clinica', priority: 'VERDE', topic: 'Nefro: Distúrbios do Potássio' },
  { id: 604, area: 'clinica', priority: 'AMARELO', topic: 'Imuno: Reações Alérgicas' },
  { id: 605, area: 'go', priority: 'DIAMANTE', topic: 'Gineco: Amenorreia Secundária' },
  { id: 606, area: 'go', priority: 'AMARELO', topic: 'Gineco: Hiperprolactinemia' },
  { id: 607, area: 'go', priority: 'VERDE', topic: 'Gineco: Síndrome dos Ovários Policísticos (SOP)' },
  { id: 608, area: 'pediatria', priority: 'DIAMANTE', topic: 'Infecto-Ped: Infecções de Vias Aéreas Superiores (IVAS)' },
  { id: 609, area: 'pediatria', priority: 'VERMELHO', topic: 'Imuno-Ped: Autoinflamatórias' },
  { id: 610, area: 'pediatria', priority: 'DIAMANTE', topic: 'Infecto-Ped: Pneumonias' },
  { id: 611, area: 'pediatria', priority: 'DIAMANTE', topic: 'Infecto-Ped: Bronquiolite e Coqueluche' },
  { id: 612, area: 'pediatria', priority: 'VERMELHO', topic: 'Infecto-Ped: COVID' },
  { id: 613, area: 'preventiva', priority: 'VERDE', topic: 'Epidemiologia: Estudos Transversais' },
  { id: 614, area: 'preventiva', priority: 'DIAMANTE', topic: 'Epidemiologia: Coorte e Caso-Controle' },
  { id: 615, area: 'cirurgia', priority: 'VERDE', topic: 'Abdome Agudo: Introdução' },
  { id: 616, area: 'cirurgia', priority: 'DIAMANTE', topic: 'Abdome Agudo: Apendicite Aguda' },
  { id: 617, area: 'cirurgia', priority: 'AMARELO', topic: 'Plástica: Cicatrização e Lesões por Pressão' },
  { id: 618, area: 'cirurgia', priority: 'AMARELO', topic: 'Plástica: Fios de Sutura' },
  { id: 619, area: 'cirurgia', priority: 'AMARELO', topic: 'Plástica: Anestésicos Locais' },

  // BLOCO 7
  { id: 701, area: 'clinica', priority: 'DIAMANTE', topic: 'Infecto: Antibióticos' },
  { id: 702, area: 'clinica', priority: 'VERDE', topic: 'Hemato: Anemias Hemolíticas' },
  { id: 703, area: 'clinica', priority: 'AMARELO', topic: 'Oncologia: emergências e cuidados paliativos' },
  { id: 704, area: 'go', priority: 'DIAMANTE', topic: 'Obstetrícia: Infecções e Gravidez' },
  { id: 705, area: 'go', priority: 'VERDE', topic: 'Obstetrícia: Rotura Prematura de Membranas' },
  { id: 706, area: 'go', priority: 'VERDE', topic: 'Gineco: Violência Sexual' },
  { id: 707, area: 'go', priority: 'AMARELO', topic: 'Obstetrícia: Interrupção Legal da Gestação' },
  { id: 708, area: 'pediatria', priority: 'VERDE', topic: 'Neonatologia: Reanimação Neonatal' },
  { id: 709, area: 'pediatria', priority: 'DIAMANTE', topic: 'Neonatologia: Infecções Congênitas' },
  { id: 710, area: 'pediatria', priority: 'VERDE', topic: 'Neonatologia: Icterícia e Colestase' },
  { id: 711, area: 'preventiva', priority: 'DIAMANTE', topic: 'História e Princípios do SUS' },
  { id: 712, area: 'preventiva', priority: 'VERDE', topic: 'APS: Cardiologia' },
  { id: 713, area: 'cirurgia', priority: 'DIAMANTE', topic: 'Urgências da Vesícula Biliar' },
  { id: 714, area: 'cirurgia', priority: 'VERDE', topic: 'Digestivo: Câncer de Esôfago' },

  // BLOCO 8
  { id: 801, area: 'clinica', priority: 'VERDE', topic: 'Neuro: Cefaleias' },
  { id: 802, area: 'clinica', priority: 'VERDE', topic: 'Geriatria: Avaliação Geriátrica Ampla' },
  { id: 803, area: 'clinica', priority: 'AMARELO', topic: 'Geriatria: Grandes Síndromes Geriátricas' },
  { id: 804, area: 'clinica', priority: 'VERMELHO', topic: 'Gastro: Avaliação de enzimas hepáticas' },
  { id: 805, area: 'clinica', priority: 'AMARELO', topic: 'Gastro: Doenças hepáticas: CBP, CEP, HAI e Wilson' },
  { id: 806, area: 'go', priority: 'DIAMANTE', topic: 'Obstetrícia: Abortamento' },
  { id: 807, area: 'go', priority: 'DIAMANTE', topic: 'Obstetrícia: Gestação Ectópica' },
  { id: 808, area: 'go', priority: 'AMARELO', topic: 'Obstetrícia: Doença Trofoblástica Gestacional' },
  { id: 809, area: 'pediatria', priority: 'VERDE', topic: 'Dermato-Ped: Dermatite Atópica e Lesões Benignas' },
  { id: 810, area: 'pediatria', priority: 'DIAMANTE', topic: 'Dermato-Ped: Dermatoses e Infecções de Partes Moles' },
  { id: 811, area: 'preventiva', priority: 'DIAMANTE', topic: 'Legislação do SUS I: Leis Orgânicas' },
  { id: 812, area: 'cirurgia', priority: 'DIAMANTE', topic: 'Abdome Agudo: Pancreatite Aguda' },
  { id: 813, area: 'cirurgia', priority: 'VERDE', topic: 'Abdome Agudo: Diverticulite' },
  { id: 814, area: 'cirurgia', priority: 'VERDE', topic: 'Abdome Agudo: Abscesso Hepático' },
  { id: 815, area: 'cirurgia', priority: 'AMARELO', topic: 'Digestivo: Disfagia e Acalasia' },
  { id: 816, area: 'cirurgia', priority: 'AMARELO', topic: 'Digestivo: Hernias de Hiato' },

  // BLOCO 9
  { id: 901, area: 'clinica', priority: 'AMARELO', topic: 'Hemato: Coagulação e Hemostasia' },
  { id: 902, area: 'clinica', priority: 'VERMELHO', topic: 'Hemato: Hemoterapia' },
  { id: 903, area: 'clinica', priority: 'DIAMANTE', topic: 'Gastro: Cirrose Hepática I' },
  { id: 904, area: 'clinica', priority: 'VERDE', topic: 'Gastro: Cirrose Hepática II' },
  { id: 905, area: 'clinica', priority: 'DIAMANTE', topic: 'Pneumo: Pneumonia Adquirida na Comunidade' },
  { id: 906, area: 'clinica', priority: 'VERDE', topic: 'Pneumo: Derrame Pleural' },
  { id: 907, area: 'go', priority: 'VERDE', topic: 'Obstetrícia: Placenta Prévia' },
  { id: 908, area: 'go', priority: 'VERDE', topic: 'Obstetrícia: DPP (Descolamento Prematuro de Placenta)' },
  { id: 909, area: 'go', priority: 'AMARELO', topic: 'Obstetrícia: Outros Sangramentos da 2ª Metade' },
  { id: 910, area: 'pediatria', priority: 'VERDE', topic: 'Hemato-Ped: Anemia Falciforme' },
  { id: 911, area: 'pediatria', priority: 'VERDE', topic: 'Hemato-Ped: Anemia Ferropriva e Talassemia' },
  { id: 912, area: 'pediatria', priority: 'VERDE', topic: 'Hemato-Ped: Hemostasia e Distúrbios Hemorrágicos' },
  { id: 913, area: 'pediatria', priority: 'VERDE', topic: 'Genética Pediátrica' },
  { id: 914, area: 'preventiva', priority: 'VERDE', topic: 'Legislação do SUS II: NOBs, NOAS e Pacto' },
  { id: 915, area: 'preventiva', priority: 'VERDE', topic: 'APS: Tabagismo' },
  { id: 916, area: 'cirurgia', priority: 'DIAMANTE', topic: 'Abdome Agudo Obstrutivo' },
  { id: 917, area: 'cirurgia', priority: 'VERMELHO', topic: 'Abdome Agudo Perfurativo e Vascular' },
  { id: 918, area: 'cirurgia', priority: 'VERDE', topic: 'Digestivo: Câncer de Estômago' },

  // BLOCO 10
  { id: 1001, area: 'clinica', priority: 'DIAMANTE', topic: 'Cardio: HAS Ambulatorial e Emergências' },
  { id: 1002, area: 'clinica', priority: 'VERDE', topic: 'Cardio: Insuficiência Cardíaca' },
  { id: 1003, area: 'clinica', priority: 'DIAMANTE', topic: 'Pneumo: Espirometria e Asma' },
  { id: 1004, area: 'clinica', priority: 'DIAMANTE', topic: 'Pneumo: DPOC' },
  { id: 1005, area: 'clinica', priority: 'VERDE', topic: 'Emergências: BLS e ACLS' },
  { id: 1006, area: 'go', priority: 'DIAMANTE', topic: 'Obstetrícia: Síndromes Hipertensivas (DHEG)' },
  { id: 1007, area: 'go', priority: 'AMARELO', topic: 'Gineco: Sangramento Uterino Anormal' },
  { id: 1008, area: 'pediatria', priority: 'VERDE', topic: 'Emergências: PALS (Suporte Avançado)' },
  { id: 1009, area: 'pediatria', priority: 'VERDE', topic: 'Cardio-Ped: Cardiopatias Congênitas' },
  { id: 1010, area: 'pediatria', priority: 'VERDE', topic: 'Cardio-Ped: Hipertensão Arterial Sistêmica' },
  { id: 1011, area: 'pediatria', priority: 'AMARELO', topic: 'Cardio-Ped: Miocardite, Síncope, IC' },
  { id: 1012, area: 'preventiva', priority: 'VERDE', topic: 'Epidemiologia: Medidas de Associação' },
  { id: 1013, area: 'preventiva', priority: 'AMARELO', topic: 'Legislação do SUS 3: Decreto 7508/11' },
  { id: 1014, area: 'clinica', priority: 'AMARELO', topic: 'Psiquiatria: RAPS' },
  { id: 1015, area: 'cirurgia', priority: 'VERDE', topic: 'Hérnias: Anatomia e Inguinal' },
  { id: 1016, area: 'cirurgia', priority: 'DIAMANTE', topic: 'Hérnias: Hernioplastia Inguinal' },
  { id: 1017, area: 'cirurgia', priority: 'AMARELO', topic: 'Digestivo: Outras Neoplasias Gástricas' },
  { id: 1018, area: 'cirurgia', priority: 'AMARELO', topic: 'Plástica: Enxertos e Retalhos' },

  // BLOCO 11
  { id: 1101, area: 'clinica', priority: 'VERDE', topic: 'Endócrino: Diabetes (Diagnóstico e Meta)' },
  { id: 1102, area: 'clinica', priority: 'DIAMANTE', topic: 'Endócrino: Diabetes (Tratamento)' },
  { id: 1103, area: 'clinica', priority: 'VERDE', topic: 'Endócrino: Emergências Hiperglicêmicas' },
  { id: 1104, area: 'clinica', priority: 'AMARELO', topic: 'Endócrino: Hiperglicemia Hospitalar' },
  { id: 1105, area: 'go', priority: 'DIAMANTE', topic: 'Obstetrícia: Diabetes na Gestação' },
  { id: 1106, area: 'go', priority: 'VERDE', topic: 'Gineco: Infertilidade' },
  { id: 1107, area: 'go', priority: 'VERDE', topic: 'Gineco: Endometriose' },
  { id: 1108, area: 'pediatria', priority: 'VERDE', topic: 'Infecto-Ped: Arboviroses' },
  { id: 1109, area: 'pediatria', priority: 'DIAMANTE', topic: 'Infecto-Ped: Doenças Exantemáticas' },
  { id: 1110, area: 'pediatria', priority: 'VERDE', topic: 'Endo-Ped: Cetoacidose Diabética (CAD)' },
  { id: 1111, area: 'preventiva', priority: 'VERDE', topic: 'Financiamento do SUS' },
  { id: 1112, area: 'preventiva', priority: 'DIAMANTE', topic: 'Epidemiologia: Ensaios Clínicos' },
  { id: 1113, area: 'preventiva', priority: 'AMARELO', topic: 'Ética em Pesquisa Clínica' },
  { id: 1114, area: 'cirurgia', priority: 'AMARELO', topic: 'Síndrome Compartimental Abdominal' },
  { id: 1115, area: 'cirurgia', priority: 'VERMELHO', topic: 'Hérnias: Incisionais' },
  { id: 1116, area: 'cirurgia', priority: 'VERMELHO', topic: 'Hérnias: Outras' },
  { id: 1117, area: 'cirurgia', priority: 'DIAMANTE', topic: 'Urgências endoscópicas' },

  // BLOCO 12
  { id: 1201, area: 'clinica', priority: 'VERDE', topic: 'Endócrino: Síndrome Metabólica e Obesidade' },
  { id: 1202, area: 'clinica', priority: 'DIAMANTE', topic: 'Endócrino: Dislipidemias' },
  { id: 1203, area: 'clinica', priority: 'VERMELHO', topic: 'Gastro: Doença Hepática Esteatótica (DHEM)' },
  { id: 1204, area: 'cirurgia', priority: 'AMARELO', topic: 'Urologia: Propedêutica em Uroginecologia' },
  { id: 1205, area: 'cirurgia', priority: 'DIAMANTE', topic: 'Urologia: Incontinência Urinária' },
  { id: 1206, area: 'cirurgia', priority: 'VERDE', topic: 'Urologia: Prolapso Genital' },
  { id: 1207, area: 'pediatria', priority: 'VERDE', topic: 'Neonatologia: Triagens Neonatais' },
  { id: 1208, area: 'pediatria', priority: 'AMARELO', topic: 'Neonatologia: Distúrbios Metabólicos' },
  { id: 1209, area: 'pediatria', priority: 'DIAMANTE', topic: 'Emergências: Peçonhentos, Raiva e Tétano' },
  { id: 1210, area: 'pediatria', priority: 'AMARELO', topic: 'Emergências: Corpo Estranho e BRUE' },
  { id: 1211, area: 'preventiva', priority: 'VERDE', topic: 'Preventiva: a Jornada Continua' },
  { id: 1212, area: 'preventiva', priority: 'VERDE', topic: 'Epidemiologia: Estatística e Valor-P' },
  { id: 1213, area: 'preventiva', priority: 'DIAMANTE', topic: 'Epidemiologia: Metanálise' },
  { id: 1214, area: 'preventiva', priority: 'VERDE', topic: 'Epidemiologia: Medicina Baseada em Evidências' },
  { id: 1215, area: 'cirurgia', priority: 'DIAMANTE', topic: 'Pré-Operatório' },
  { id: 1216, area: 'cirurgia', priority: 'DIAMANTE', topic: 'Urologia: Uro-Oncologia' },
  { id: 1217, area: 'cirurgia', priority: 'VERDE', topic: 'Digestivo: Cirurgia Bariátrica' },

  // BLOCO 13
  { id: 1301, area: 'clinica', priority: 'AMARELO', topic: 'Reumato: Vasculites' },
  { id: 1302, area: 'clinica', priority: 'DIAMANTE', topic: 'Infecto: Tuberculose (Diagnóstico)' },
  { id: 1303, area: 'clinica', priority: 'VERDE', topic: 'Infecto: Tuberculose (Tratamento)' },
  { id: 1304, area: 'go', priority: 'DIAMANTE', topic: 'Obstetrícia: Avaliação de Vitalidade Fetal' },
  { id: 1305, area: 'go', priority: 'VERDE', topic: 'Obstetrícia: RCIU (Restrição de Crescimento)' },
  { id: 1306, area: 'go', priority: 'AMARELO', topic: 'Obstetrícia: Sofrimento Fetal Crônico' },
  { id: 1307, area: 'go', priority: 'AMARELO', topic: 'Obstetrícia: Gemelaridade' },
  { id: 1308, area: 'pediatria', priority: 'DIAMANTE', topic: 'Neuro-Ped: Convulsão Febril' },
  { id: 1309, area: 'pediatria', priority: 'VERDE', topic: 'Infecto-Ped: Tuberculose' },
  { id: 1310, area: 'pediatria', priority: 'AMARELO', topic: 'Pediatria Geral' },
  { id: 1311, area: 'preventiva', priority: 'VERDE', topic: 'APS: Diabetes no SUS' },
  { id: 1312, area: 'preventiva', priority: 'DIAMANTE', topic: 'APS: Estratégia Saúde da Família' },
  { id: 1313, area: 'cirurgia', priority: 'DIAMANTE', topic: 'REMIT e pós-operatório' },
  { id: 1314, area: 'cirurgia', priority: 'VERDE', topic: 'Perioperatório: Complicações' },
  { id: 1315, area: 'cirurgia', priority: 'AMARELO', topic: 'Plástica: Fraturas de Face' },
  { id: 1316, area: 'cirurgia', priority: 'AMARELO', topic: 'Plástica: Paralisia Facial' },
  { id: 1317, area: 'cirurgia', priority: 'VERDE', topic: 'Urologia: HPB (Hiperplasia Prostática)' },
  { id: 1318, area: 'cirurgia', priority: 'VERDE', topic: 'Cirurgia Geral: Respiro' },

  // BLOCO 14
  { id: 1401, area: 'clinica', priority: 'VERDE', topic: 'Neuro: Meningites & Encefalites' },
  { id: 1402, area: 'clinica', priority: 'VERMELHO', topic: 'Neuro: Doenças Neuromusculares e Parkinson' },
  { id: 1403, area: 'clinica', priority: 'DIAMANTE', topic: 'Cardio: Taquiarritmias' },
  { id: 1404, area: 'clinica', priority: 'VERDE', topic: 'Cardio: Bradiarritimias' },
  { id: 1405, area: 'clinica', priority: 'VERDE', topic: 'Cardio: Síncope' },
  { id: 1406, area: 'clinica', priority: 'AMARELO', topic: 'Cardio: Doenças Valvares' },
  { id: 1407, area: 'go', priority: 'VERMELHO', topic: 'Obstetrícia: Cardiopatias na Gravidez' },
  { id: 1408, area: 'go', priority: 'DIAMANTE', topic: 'Gineco: Anticoncepção' },
  { id: 1409, area: 'pediatria', priority: 'DIAMANTE', topic: 'Reumato-Ped: Kawasaki e Febre Reumática' },
  { id: 1410, area: 'pediatria', priority: 'VERDE', topic: 'Reumato-Ped: Artrite Idiopática Juvenil' },
  { id: 1411, area: 'pediatria', priority: 'DIAMANTE', topic: 'Infecto-Ped: Meningite e Encefalite' },
  { id: 1412, area: 'preventiva', priority: 'DIAMANTE', topic: 'Financiamento da APS' },
  { id: 1413, area: 'clinica', priority: 'VERDE', topic: 'Psiquiatria: Sídrome Depressiva' },
  { id: 1414, area: 'clinica', priority: 'VERMELHO', topic: 'Psiquiatria: Sídrome Maníaca' },
  { id: 1415, area: 'cirurgia', priority: 'VERDE', topic: 'Digestivo: Câncer Colorretal' },
  { id: 1416, area: 'cirurgia', priority: 'VERDE', topic: 'Digestivo: Doenças Orificiais' },
  { id: 1417, area: 'cirurgia', priority: 'AMARELO', topic: 'Digestivo: Vesícula Biliar' },

  // BLOCO 15
  { id: 1501, area: 'clinica', priority: 'VERMELHO', topic: 'Emergências: Via Aérea e VNI' },
  { id: 1502, area: 'clinica', priority: 'VERDE', topic: 'UTI: SDRA' },
  { id: 1503, area: 'clinica', priority: 'VERMELHO', topic: 'UTI: Ventilação Mecânica' },
  { id: 1504, area: 'clinica', priority: 'VERMELHO', topic: 'UTI: Infecções Nosocomiais' },
  { id: 1505, area: 'clinica', priority: 'VERDE', topic: 'UTI: Choque' },
  { id: 1506, area: 'clinica', priority: 'VERMELHO', topic: 'UTI: Drogas Vasoativas' },
  { id: 1507, area: 'clinica', priority: 'VERMELHO', topic: 'Hemato: Vacinação Adulto' },
  { id: 1508, area: 'go', priority: 'DIAMANTE', topic: 'Mastologia: Propedêutica' },
  { id: 1509, area: 'go', priority: 'VERDE', topic: 'Mastologia: Principais Sintomas' },
  { id: 1510, area: 'go', priority: 'AMARELO', topic: 'Mastologia: Lesões Benignas' },
  { id: 1511, area: 'pediatria', priority: 'DIAMANTE', topic: 'Infecto-Ped: Vacinação' },
  { id: 1512, area: 'pediatria', priority: 'VERMELHO', topic: 'Infecto-Ped: HIV' },
  { id: 1513, area: 'cirurgia', priority: 'DIAMANTE', topic: 'Ortopedia Pediátrica' },
  { id: 1514, area: 'cirurgia', priority: 'AMARELO', topic: 'Ortopedia Ped: Osteomielite' },
  { id: 1515, area: 'preventiva', priority: 'DIAMANTE', topic: 'APS: Ferramentas da APS/ESF' },
  { id: 1516, area: 'clinica', priority: 'AMARELO', topic: 'Psiquiatria: Síndrome Ansiosa' },
  { id: 1517, area: 'cirurgia', priority: 'DIAMANTE', topic: 'Digestivo: Fígado para perdidos' },
  { id: 1518, area: 'cirurgia', priority: 'VERDE', topic: 'Digestivo: Nódulos hepáticos' },

  // BLOCO 16
  { id: 1601, area: 'cirurgia', priority: 'VERMELHO', topic: 'Digestivo: Ferimento descolante' },
  { id: 1602, area: 'clinica', priority: 'DIAMANTE', topic: 'Nefro: Injúria Renal (IRA)' },
  { id: 1603, area: 'clinica', priority: 'VERDE', topic: 'Gastro: Diarreias Agudas' },
  { id: 1604, area: 'clinica', priority: 'VERMELHO', topic: 'Gastro: Diarreias Crônicas' },
  { id: 1605, area: 'clinica', priority: 'AMARELO', topic: 'Gastro: DII (Inflamatória Intestinal)' },
  { id: 1606, area: 'clinica', priority: 'AMARELO', topic: 'Infecto: Doenças Negligenciadas' },
  { id: 1607, area: 'go', priority: 'DIAMANTE', topic: 'Obstetrícia: Trabalho de Parto Prematuro' },
  { id: 1608, area: 'go', priority: 'AMARELO', topic: 'Obstetrícia: Colo Curto e Incompetência' },
  { id: 1609, area: 'pediatria', priority: 'VERDE', topic: 'Endo-Ped: Hiperplasia Adrenal' },
  { id: 1610, area: 'pediatria', priority: 'AMARELO', topic: 'Endo-Ped: Hipotireoidismo' },
  { id: 1611, area: 'pediatria', priority: 'VERMELHO', topic: 'Endo-Ped: Diferenças no Desenvolvimento Sexual' },
  { id: 1612, area: 'pediatria', priority: 'AMARELO', topic: 'Nutrologia em Pediatria' },
  { id: 1613, area: 'preventiva', priority: 'DIAMANTE', topic: 'APS: Telessaúde' },
  { id: 1614, area: 'preventiva', priority: 'DIAMANTE', topic: 'APS: Método Clínico Centrado na Pessoa' },
  { id: 1615, area: 'cirurgia', priority: 'DIAMANTE', topic: 'Urologia: Litíase Renal' },
  { id: 1616, area: 'cirurgia', priority: 'VERMELHO', topic: 'Digestivo: Carcinoma hepatocelular' },
  { id: 1617, area: 'cirurgia', priority: 'AMARELO', topic: 'Vascular: Aneurisma de aorta' },

  // BLOCO 17
  { id: 1701, area: 'clinica', priority: 'DIAMANTE', topic: 'Reumato: Lúpus (LES)' },
  { id: 1702, area: 'clinica', priority: 'AMARELO', topic: 'Reumato: Osteoporose' },
  { id: 1703, area: 'clinica', priority: 'VERMELHO', topic: 'Reumato: Esclerose Sistêmica' },
  { id: 1704, area: 'clinica', priority: 'VERMELHO', topic: 'Reumato: Sjögren' },
  { id: 1705, area: 'clinica', priority: 'VERMELHO', topic: 'Reumato: Miopatias' },
  { id: 1706, area: 'clinica', priority: 'VERDE', topic: 'Nefro: Glomerulopatias' },
  { id: 1707, area: 'clinica', priority: 'DIAMANTE', topic: 'Intoxicações Exógenas' },
  { id: 1708, area: 'go', priority: 'DIAMANTE', topic: 'Obstetrícia: Hemorragia pós parto' },
  { id: 1709, area: 'go', priority: 'AMARELO', topic: 'Obstetrícia: Puerpério' },
  { id: 1710, area: 'pediatria', priority: 'DIAMANTE', topic: 'Pneumo-Ped: Asma' },
  { id: 1711, area: 'pediatria', priority: 'DIAMANTE', topic: 'Pneumo-Ped: Fibrose Cística' },
  { id: 1712, area: 'pediatria', priority: 'AMARELO', topic: 'Imuno-Ped: Imunodeficiências' },
  { id: 1713, area: 'preventiva', priority: 'DIAMANTE', topic: 'Epidemiologia: Vigilância em Saúde' },
  { id: 1714, area: 'preventiva', priority: 'AMARELO', topic: 'APS: ReSOAP' },
  { id: 1715, area: 'cirurgia', priority: 'AMARELO', topic: 'Digestivo: Metástases hepáticas' },
  { id: 1716, area: 'cirurgia', priority: 'AMARELO', topic: 'Digestivo: Adenocarcinoma de pâncreas' },
  { id: 1717, area: 'cirurgia', priority: 'AMARELO', topic: 'Digestivo: Fígado e VB Quiz' },

  // BLOCO 18
  { id: 1801, area: 'clinica', priority: 'VERDE', topic: 'Infecto: HIV e Oportunistas' },
  { id: 1802, area: 'clinica', priority: 'DIAMANTE', topic: 'Endócrino: Tireoide (Fisiologia e Hipo)' },
  { id: 1803, area: 'clinica', priority: 'VERDE', topic: 'Endócrino: Hipertireoidismo' },
  { id: 1804, area: 'clinica', priority: 'VERMELHO', topic: 'Neuro: Epilepsia' },
  { id: 1805, area: 'clinica', priority: 'AMARELO', topic: 'Neuro: Esclerose Múltipla' },
  { id: 1806, area: 'go', priority: 'DIAMANTE', topic: 'Gineco: Câncer de Colo de Útero (Rastreio)' },
  { id: 1807, area: 'go', priority: 'DIAMANTE', topic: 'Gineco: Câncer de Colo de Útero (Diagnóstico)' },
  { id: 1808, area: 'go', priority: 'VERMELHO', topic: 'Gineco: Vulva e Vagina' },
  { id: 1809, area: 'pediatria', priority: 'AMARELO', topic: 'Neonatologia: Sepse' },
  { id: 1810, area: 'pediatria', priority: 'DIAMANTE', topic: 'Neonatologia: Desconforto Respiratório' },
  { id: 1811, area: 'pediatria', priority: 'VERMELHO', topic: 'Neonatologia: Outras Doenças' },
  { id: 1812, area: 'pediatria', priority: 'VERMELHO', topic: 'Neonatologia: Nutrição do Pré-Termo' },
  { id: 1813, area: 'preventiva', priority: 'VERDE', topic: 'Epidemiologia: Processo Epidêmico' },
  { id: 1814, area: 'preventiva', priority: 'AMARELO', topic: 'APS: Abordagem Familiar' },
  { id: 1815, area: 'cirurgia', priority: 'DIAMANTE', topic: 'Urologia: Síndrome de Fournier' },
  { id: 1816, area: 'cirurgia', priority: 'VERMELHO', topic: 'Ortopedia Geral' },
  { id: 1817, area: 'cirurgia', priority: 'AMARELO', topic: 'Vascular: TVP' },
  { id: 1818, area: 'cirurgia', priority: 'AMARELO', topic: 'Torácica: Pneumotórax' },

  // BLOCO 19
  { id: 1901, area: 'clinica', priority: 'DIAMANTE', topic: 'Pneumo: TEP' },
  { id: 1902, area: 'clinica', priority: 'VERMELHO', topic: 'Pneumo: Distúrbios do Sono' },
  { id: 1903, area: 'clinica', priority: 'VERMELHO', topic: 'Pneumo: Doenças Intersticiais (DPI)' },
  { id: 1904, area: 'clinica', priority: 'AMARELO', topic: 'Pneumo: Nódulo Pulmonar' },
  { id: 1905, area: 'clinica', priority: 'AMARELO', topic: 'Endócrino: Adrenal' },
  { id: 1906, area: 'clinica', priority: 'AMARELO', topic: 'Endócrino: Cushing' },
  { id: 1907, area: 'clinica', priority: 'VERMELHO', topic: 'Gastro: Disfagia e Esofagite' },
  { id: 1908, area: 'go', priority: 'DIAMANTE', topic: 'Mastologia: Câncer de Mama (Rastreio)' },
  { id: 1909, area: 'go', priority: 'DIAMANTE', topic: 'Mastologia: Câncer de Mama (Fatores de Risco)' },
  { id: 1910, area: 'go', priority: 'AMARELO', topic: 'Mastologia: Câncer de Mama (Invasivo)' },
  { id: 1911, area: 'pediatria', priority: 'VERDE', topic: 'Infecto-Ped: Parasitoses' },
  { id: 1912, area: 'pediatria', priority: 'DIAMANTE', topic: 'Onco-Ped: Neoplasias' },
  { id: 1913, area: 'preventiva', priority: 'DIAMANTE', topic: 'Trabalho: Acidente de Trabalho' },
  { id: 1914, area: 'clinica', priority: 'VERMELHO', topic: 'Psiquiatria: Psicose' },
  { id: 1915, area: 'clinica', priority: 'VERMELHO', topic: 'Psiquiatria: Psicofarmacologia' },
  { id: 1916, area: 'cirurgia', priority: 'VERMELHO', topic: 'Oncocirurgia Geral' },
  { id: 1917, area: 'cirurgia', priority: 'AMARELO', topic: 'Vascular: Isquemia de membros' },

  // BLOCO 20
  { id: 2001, area: 'clinica', priority: 'DIAMANTE', topic: 'Nefro: ITU' },
  { id: 2002, area: 'clinica', priority: 'AMARELO', topic: 'Nefro: Distúrbios Eletrolíticos (Ca, P, Mg)' },
  { id: 2003, area: 'clinica', priority: 'AMARELO', topic: 'Nefro: Doença Renal Crônica' },
  { id: 2004, area: 'go', priority: 'DIAMANTE', topic: 'Gineco: Climatério' },
  { id: 2005, area: 'go', priority: 'DIAMANTE', topic: 'Gineco: Terapia Hormonal' },
  { id: 2006, area: 'go', priority: 'VERMELHO', topic: 'Gineco: Tumores Anexiais' },
  { id: 2007, area: 'go', priority: 'AMARELO', topic: 'Gineco: Câncer de Ovário' },
  { id: 2008, area: 'pediatria', priority: 'AMARELO', topic: 'Nefro-Ped: ITU' },
  { id: 2009, area: 'pediatria', priority: 'VERMELHO', topic: 'Emergências: Sedoanalgesia' },
  { id: 2010, area: 'pediatria', priority: 'AMARELO', topic: 'Emergências: Sepse' },
  { id: 2011, area: 'pediatria', priority: 'AMARELO', topic: 'Emergências: Choque' },
  { id: 2012, area: 'preventiva', priority: 'AMARELO', topic: 'Trabalho: Pneumoconioses' },

  // BLOCO 21
  { id: 2101, area: 'preventiva', priority: 'DIAMANTE', topic: 'APS: Tuberculose e Hanseníase' },
  { id: 2102, area: 'preventiva', priority: 'VERMELHO', topic: 'Saúde Planetária' },
  { id: 2103, area: 'cirurgia', priority: 'DIAMANTE', topic: 'Cirurgia: Resumão' },
  { id: 2104, area: 'cirurgia', priority: 'AMARELO', topic: 'Digestivo: Cistos Pancreáticos' },
  { id: 2105, area: 'cirurgia', priority: 'VERMELHO', topic: 'Digestivo: Pancreatite Crônica' },
  { id: 2106, area: 'cirurgia', priority: 'AMARELO', topic: 'Vascular: Trauma Vascular' },
  { id: 2107, area: 'cirurgia', priority: 'AMARELO', topic: 'Vascular: Estenose Carotídea' },
  { id: 2108, area: 'cirurgia', priority: 'VERMELHO', topic: 'Torácica: Câncer de Pulmão' },
  { id: 2109, area: 'clinica', priority: 'VERDE', topic: 'Geriatria: Depressão e Delirium' },
  { id: 2110, area: 'clinica', priority: 'DIAMANTE', topic: 'Geriatria: Demência' },
  { id: 2111, area: 'go', priority: 'DIAMANTE', topic: 'Gineco: Hiperplasia Endometrial' },
  { id: 2112, area: 'go', priority: 'AMARELO', topic: 'Gineco: Câncer de Endométrio' },
  { id: 2113, area: 'go', priority: 'AMARELO', topic: 'Obstetrícia: Outras Intercorrências' },
  { id: 2114, area: 'cirurgia', priority: 'DIAMANTE', topic: 'Cirurgia Pediátrica' },
  { id: 2115, area: 'cirurgia', priority: 'VERDE', topic: 'Uropediatria' },
  { id: 2116, area: 'cirurgia', priority: 'AMARELO', topic: 'Malformações Congênitas' },
  { id: 2117, area: 'preventiva', priority: 'DIAMANTE', topic: 'Legal: Declaração de Óbito' },
  { id: 2118, area: 'preventiva', priority: 'DIAMANTE', topic: 'APS: Populações Específicas' },
  { id: 2119, area: 'cirurgia', priority: 'AMARELO', topic: 'Videolaparoscopia' },
  { id: 2120, area: 'cirurgia', priority: 'AMARELO', topic: 'Eletrocirurgia' },
  { id: 2121, area: 'cirurgia', priority: 'AMARELO', topic: 'Digestivo: Tumores Neuroendócrinos' },
  { id: 2122, area: 'cirurgia', priority: 'AMARELO', topic: 'Nutrição perioperatória' },
  { id: 2123, area: 'cirurgia', priority: 'VERDE', topic: 'Cabeça e Pescoço: Massas cervicais' },
  { id: 2124, area: 'cirurgia', priority: 'AMARELO', topic: 'Vascular: Insuficiência Venosa' },
  { id: 2125, area: 'cirurgia', priority: 'AMARELO', topic: 'Vascular: Síndromes Compressivas' },

  // BLOCO 22
  { id: 2201, area: 'clinica', priority: 'VERDE', topic: 'Infecto: Viroses' },
  { id: 2202, area: 'clinica', priority: 'DIAMANTE', topic: 'Infecto: Arboviroses' },
  { id: 2203, area: 'clinica', priority: 'VERDE', topic: 'Infecto: Febre Maculosa' },
  { id: 2204, area: 'clinica', priority: 'DIAMANTE', topic: 'Hepatites Virais' },
  { id: 2205, area: 'go', priority: 'AMARELO', topic: 'Gineco: Reprodução Assistida' },
  { id: 2206, area: 'go', priority: 'AMARELO', topic: 'Gineco: LGBTQIAPN+' },
  { id: 2207, area: 'pediatria', priority: 'AMARELO', topic: 'Adolescência' },
  { id: 2208, area: 'pediatria', priority: 'VERMELHO', topic: 'Ética em Pediatria' },
  { id: 2209, area: 'preventiva', priority: 'DIAMANTE', topic: 'Legal: Ética Médica' },
  { id: 2210, area: 'preventiva', priority: 'AMARELO', topic: 'Trabalho: PAIRO e Burnout' },
  { id: 2211, area: 'preventiva', priority: 'AMARELO', topic: 'APS: Dermatologia' },
  { id: 2212, area: 'cirurgia', priority: 'AMARELO', topic: 'Digestivo: Intestino Delgado' },
  { id: 2213, area: 'cirurgia', priority: 'AMARELO', topic: 'Digestivo: Baço' },
  { id: 2214, area: 'cirurgia', priority: 'VERMELHO', topic: 'Cabeça e Pescoço: CEC' },
  { id: 2215, area: 'cirurgia', priority: 'VERMELHO', topic: 'Torácica: Traqueia' },
  { id: 2216, area: 'cirurgia', priority: 'AMARELO', topic: 'Torácica: Bronquiectasias' },

  // BLOCO 23
  { id: 2301, area: 'clinica', priority: 'AMARELO', topic: 'Endócrino: Hiperaldo' },
  { id: 2302, area: 'clinica', priority: 'VERMELHO', topic: 'Endócrino: Feocromocitoma' },
  { id: 2303, area: 'clinica', priority: 'VERMELHO', topic: 'Endócrino: Prolactinomas' },
  { id: 2304, area: 'clinica', priority: 'AMARELO', topic: 'Onco-Hematologia' },
  { id: 2305, area: 'go', priority: 'VERMELHO', topic: 'Gineco: Cirurgia Ginecológica' },
  { id: 2306, area: 'go', priority: 'VERMELHO', topic: 'Obstetrícia: Psiquiatria Perinatal' },
  { id: 2307, area: 'clinica', priority: 'AMARELO', topic: 'Psiquiatria: Emergências' },
  { id: 2308, area: 'preventiva', priority: 'DIAMANTE', topic: 'Violência e Vulnerabilidade' },
  { id: 2309, area: 'preventiva', priority: 'DIAMANTE', topic: 'Saúde Suplementar e Judicialização' },
  { id: 2310, area: 'pediatria', priority: 'AMARELO', topic: 'Psiquiatria Infantil' },
  { id: 2311, area: 'pediatria', priority: 'AMARELO', topic: 'Neuro-Ped: Epilepsias' },
  { id: 2312, area: 'cirurgia', priority: 'AMARELO', topic: 'Digestivo: Cisto Pilonidal' },
  { id: 2313, area: 'cirurgia', priority: 'AMARELO', topic: 'Cabeça e Pescoço: Anomalias' },
  { id: 2314, area: 'cirurgia', priority: 'AMARELO', topic: 'Torácica: Mediastino' },

  // BLOCO 24
  { id: 2401, area: 'clinica', priority: 'AMARELO', topic: 'Dermatologia' },
  { id: 2402, area: 'go', priority: 'VERMELHO', topic: 'Medicina Fetal' },
  { id: 2403, area: 'cirurgia', priority: 'AMARELO', topic: 'Otorrino: Otites e Sinusites' },
  { id: 2404, area: 'cirurgia', priority: 'AMARELO', topic: 'Otorrino: Rinites e Laringe' },
  { id: 2405, area: 'clinica', priority: 'AMARELO', topic: 'Psiquiatria: Transtornos Alimentares' },
  { id: 2406, area: 'cirurgia', priority: 'AMARELO', topic: 'Digestivo: Endoscopia' },
  { id: 2407, area: 'cirurgia', priority: 'AMARELO', topic: 'Cabeça e Pescoço: Tireoide' },
  { id: 2408, area: 'cirurgia', priority: 'AMARELO', topic: 'Cabeça e Pescoço: Paratireoide' },
  { id: 2409, area: 'cirurgia', priority: 'AMARELO', topic: 'Neurocirurgia' },

  // BLOCO 25
  { id: 2501, area: 'cirurgia', priority: 'AMARELO', topic: 'Anestesiologia' },
  { id: 2502, area: 'preventiva', priority: 'AMARELO', topic: 'Trabalho: Saúde do Trabalhador' },
  { id: 2503, area: 'cirurgia', priority: 'VERMELHO', topic: 'Oftalmopediatria' },
  { id: 2504, area: 'go', priority: 'AMARELO', topic: 'Obstetrícia: Doença Hemolítica' },
  { id: 2505, area: 'go', priority: 'AMARELO', topic: 'Obstetrícia: Trombofilias' },
  { id: 2506, area: 'cirurgia', priority: 'AMARELO', topic: 'Oftalmologia I' },
  { id: 2507, area: 'cirurgia', priority: 'AMARELO', topic: 'Otorrino: Otologia II' },
  { id: 2508, area: 'cirurgia', priority: 'AMARELO', topic: 'Otorrino: Otologia I' },
  { id: 2509, area: 'cirurgia', priority: 'VERDE', topic: 'Otorrino: Rinologia' },

  // BLOCO 26
  { id: 2601, area: 'cirurgia', priority: 'AMARELO', topic: 'Otorrino: Bucofaringo I' },
  { id: 2602, area: 'cirurgia', priority: 'AMARELO', topic: 'Otorrino: Bucofaringo II' },
  { id: 2603, area: 'cirurgia', priority: 'AMARELO', topic: 'Oftalmologia II' },
  { id: 2604, area: 'go', priority: 'AMARELO', topic: 'Gineco: Urgências' },
  { id: 2605, area: 'pediatria', priority: 'VERMELHO', topic: 'Neuro-Ped: Malformações' },
  { id: 2606, area: 'pediatria', priority: 'VERMELHO', topic: 'Neuro-Ped: Doenças Neuromusculares' },
  { id: 2607, area: 'clinica', priority: 'AMARELO', topic: 'Psiquiatria: Álcool e Drogas' },
  { id: 2608, area: 'preventiva', priority: 'VERDE', topic: 'Preventiva: Reta Final' },
  { id: 2609, area: 'cirurgia', priority: 'AMARELO', topic: 'Cirurgia Cardíaca' }

].map(s => ({ ...s, watched: false, read: false, accuracy: 0, nextReview: null }));

// --- COMPONENTES AUXILIARES ---

const QuestionsHeatmap = ({ data }: any) => {
  const dates = useMemo(() => {
    const d: string[] = [];
    const start = new Date('2025-01-01');
    const end = new Date('2027-12-31');
    for (let i = new Date(start); i <= end; i.setDate(i.getDate() + 1)) d.push(new Date(i).toISOString().split('T')[0]);
    return d;
  }, []);
  const today = getLocalDate();
  const total = useMemo(() => data.reduce((acc: number, curr: any) => acc + (curr.questions || 0), 0), [data]);
  const getIntensity = (dateStr: string) => {
    const entry = data.find((d: any) => d.date === dateStr);
    if (dateStr > today) return 'bg-slate-800/30';
    if (!entry) return 'bg-slate-800';
    const val = entry.questions;
    return val === 0 ? 'bg-slate-800' : val < 15 ? 'bg-red-500 opacity-40' : 'bg-red-500 opacity-80';
  };
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-400 font-bold uppercase flex items-center gap-2"><Activity size={12} /> Questões</span>
        <span className="text-[10px] font-bold text-slate-300 bg-slate-900/50 border border-slate-700 px-2 py-0.5 rounded-md shadow-sm">Total: {total.toLocaleString('pt-BR')}</span>
      </div>
      <div className="overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex flex-col flex-wrap h-[120px] content-start gap-[2px] min-w-max">
          {dates.map(d => (
            <div key={d} className={`w-2 h-2 rounded-[1px] ${getIntensity(d)} ${d === today ? 'ring-1 ring-white' : ''}`} title={`${d}: ${data.find((x: any) => x.date === d)?.questions || 0}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

const EvolutionChart = ({ data, areaId }: any) => {
  const areaData = (data || [])
    .filter((d: any) => d.area === areaId)
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const color = getArea(areaId).color;

  if (areaData.length < 2) {
    return (
      <div className="w-full bg-slate-900/50 rounded-xl p-4 border border-slate-700">
        <div className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
          {getArea(areaId).label}
        </div>
        <div className="text-xs text-slate-500 italic p-4 text-center">Dados insuficientes</div>
      </div>
    );
  }

  const PLOT_LEFT = 25;
  const PLOT_RIGHT = 295;
  const average = Math.round(areaData.reduce((acc: number, d: any) => acc + d.accuracy, 0) / areaData.length);
  const avgY = 90 - (average / 100) * 80;
  const trendDiff = areaData[areaData.length - 1].accuracy - areaData[0].accuracy;

  const points = areaData.map((d: any, i: number) => {
    const x = PLOT_LEFT + (i / (areaData.length - 1 || 1)) * (PLOT_RIGHT - PLOT_LEFT);
    const y = 90 - (d.accuracy / 100) * 80;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full bg-slate-900/50 rounded-xl p-4 border border-slate-700">
      <div className="flex justify-between items-start mb-2">
        <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
          {getArea(areaId).label}
        </div>
        <div className="text-right">
          <div><span className="text-lg font-black text-white">{average}%</span><span className="text-slate-500 text-[10px] font-bold uppercase ml-1">média</span></div>
          <div className={`text-[10px] font-bold ${trendDiff > 0 ? 'text-emerald-400' : trendDiff < 0 ? 'text-red-400' : 'text-slate-500'}`}>
            {trendDiff > 0 ? '↑' : trendDiff < 0 ? '↓' : '–'} {Math.abs(trendDiff)}pts desde o início
          </div>
        </div>
      </div>

      <svg width="100%" height="110" viewBox="0 0 300 110" className="overflow-visible">
        <text x="0" y="14" fontSize="8" fill="#64748b">100%</text>
        <text x="4" y="54" fontSize="8" fill="#64748b">50%</text>
        <text x="8" y="94" fontSize="8" fill="#64748b">0%</text>

        <line x1={PLOT_LEFT} y1="10" x2={PLOT_RIGHT} y2="10" stroke="#334155" strokeWidth="0.5" strokeDasharray="4" />
        <line x1={PLOT_LEFT} y1="50" x2={PLOT_RIGHT} y2="50" stroke="#334155" strokeWidth="0.5" strokeDasharray="4" />
        <line x1={PLOT_LEFT} y1="90" x2={PLOT_RIGHT} y2="90" stroke="#334155" strokeWidth="0.5" strokeDasharray="4" />

        <line x1={PLOT_LEFT} y1={avgY} x2={PLOT_RIGHT} y2={avgY} stroke={color} strokeWidth="1" strokeDasharray="3" opacity="0.6" />

        <polyline fill="none" stroke={color} strokeWidth="2" points={points} strokeLinecap="round" strokeLinejoin="round" />

        {areaData.map((d: any, i: number) => {
          const x = PLOT_LEFT + (i / (areaData.length - 1 || 1)) * (PLOT_RIGHT - PLOT_LEFT);
          const y = 90 - (d.accuracy / 100) * 80;
          return (
            <circle key={i} cx={x} cy={y} r="3.5" fill="#0f172a" stroke={color} strokeWidth="1.5">
              <title>{`${new Date(d.date).toLocaleDateString('pt-BR')} — ${d.accuracy}%`}</title>
            </circle>
          );
        })}
      </svg>
    </div>
  );
};

const PerformanceView = ({ manualPerformance, setManualPerformance }: any) => {
  const [filterArea, setFilterArea] = useState('ALL');
  const [openMonths, setOpenMonths] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    return filterArea === 'ALL' ? manualPerformance : manualPerformance.filter((l: any) => l.area === filterArea);
  }, [manualPerformance, filterArea]);

  const summary = useMemo(() => {
    if (filtered.length === 0) return null;
    const totalQ = filtered.reduce((acc: number, l: any) => acc + (l.questions || 0), 0);
    const avgAcc = Math.round(filtered.reduce((acc: number, l: any) => acc + l.accuracy, 0) / filtered.length);
    const sorted = [...filtered].sort((a: any, b: any) => a.date.localeCompare(b.date));
    const last5 = sorted.slice(-5);
    const prev5 = sorted.slice(-10, -5);
    const last5Avg = last5.length ? Math.round(last5.reduce((a: number, l: any) => a + l.accuracy, 0) / last5.length) : 0;
    const prev5Avg = prev5.length ? Math.round(prev5.reduce((a: number, l: any) => a + l.accuracy, 0) / prev5.length) : null;
    const trend = prev5Avg !== null ? last5Avg - prev5Avg : 0;
    return { totalQ, avgAcc, trend };
  }, [filtered]);

  const grouped = useMemo(() => {
    const groups: Record<string, any[]> = {};
    [...filtered].sort((a: any, b: any) => b.date.localeCompare(a.date)).forEach((log: any) => {
      const monthKey = log.date.slice(0, 7);
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(log);
    });
    return groups;
  }, [filtered]);

  const toggleMonth = (key: string) => setOpenMonths(prev => ({ ...prev, [key]: prev[key] === false ? true : false }));

  const monthLabel = (key: string) => {
    const [y, m] = key.split('-');
    const names = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
    return `${names[parseInt(m) - 1]} ${y}`;
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-8">
      <h2 className="text-xl font-bold flex items-center gap-2"><BarChart3 className="text-emerald-500" /> Evolução de Acertos</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.values(AREAS).map((area: any) => (
          <EvolutionChart key={area.id} data={manualPerformance.filter((l: any) => l.area === area.id)} areaId={area.id} />
        ))}
      </div>

      <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <h3 className="text-lg font-bold text-white">Registros Detalhados</h3>
          <div className="flex overflow-x-auto gap-2 scrollbar-hide">
            <button onClick={() => setFilterArea('ALL')} className={`px-3 py-1.5 rounded-full whitespace-nowrap text-[10px] font-bold transition-all ${filterArea === 'ALL' ? 'bg-purple-600 text-white ring-2 ring-purple-400' : 'bg-slate-900 text-slate-400 hover:bg-slate-700'}`}>Todas</button>
            {Object.values(AREAS).map((area: any) => (
              <button key={area.id} onClick={() => setFilterArea(area.id)} className={`flex items-center gap-1 px-3 py-1.5 rounded-full whitespace-nowrap text-[10px] font-bold transition-all ${filterArea === area.id ? 'bg-purple-600 text-white ring-2 ring-purple-400' : 'bg-slate-900 text-slate-400 hover:bg-slate-700'}`}>
                <area.icon size={12} /> {area.label}
              </button>
            ))}
          </div>
        </div>

        {summary && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-center">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Questões</div>
              <div className="text-xl font-black text-white">{summary.totalQ}</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-center">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Média</div>
              <div className="text-xl font-black text-white">{summary.avgAcc}%</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-center">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Tendência</div>
              <div className={`text-xl font-black ${summary.trend > 0 ? 'text-emerald-400' : summary.trend < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                {summary.trend > 0 ? '↑' : summary.trend < 0 ? '↓' : '–'} {Math.abs(summary.trend)}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {Object.keys(grouped).length === 0 && <p className="text-slate-500 italic text-center py-10">Nenhum registro encontrado.</p>}
          {Object.keys(grouped).sort((a, b) => b.localeCompare(a)).map(monthKey => {
            const isOpen = openMonths[monthKey] !== false;
            return (
              <div key={monthKey} className="border border-slate-800 rounded-xl overflow-hidden">
                <button onClick={() => toggleMonth(monthKey)} className="w-full flex justify-between items-center px-4 py-3 bg-slate-900/60 hover:bg-slate-900 transition-colors">
                  <span className="text-sm font-bold text-slate-300 capitalize">{monthLabel(monthKey)}</span>
                  <span className="flex items-center gap-2 text-xs text-slate-500">
                    {grouped[monthKey].length} registro(s)
                    <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </span>
                </button>
                {isOpen && (
                  <div className="p-3 space-y-2 bg-slate-950/30">
                    {grouped[monthKey].map((log: any) => (
                      <div key={log.id} className="bg-slate-900/50 p-4 rounded-xl flex justify-between items-center border border-slate-800 group">
                        <div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase">{log.date.split('-').reverse().join('/')} • {getArea(log.area).label}</div>
                          <div className="font-bold text-slate-200">{log.subtopic || 'Geral'}</div>
                          <div className="text-xs text-slate-500">{log.questions} questões feitas</div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className={`text-xl font-black ${log.accuracy >= 80 ? 'text-emerald-400' : log.accuracy >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{log.accuracy}%</div>
                          <button onClick={() => setManualPerformance(manualPerformance.filter((m: any) => m.id !== log.id))} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const AreaOverviewCards = ({ subjects, manualPerformance }: any) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {Object.values(AREAS).filter((a: any) => a.id !== 'simulado').map((area: any) => {
        const areaSubjects = subjects.filter((s: any) => s.area === area.id);
        const reviewed = areaSubjects.filter((s: any) => s.nextReview).length;
        const pct = areaSubjects.length > 0 ? Math.round((reviewed / areaSubjects.length) * 100) : 0;
        const questoes = manualPerformance
          .filter((l: any) => l.area === area.id)
          .reduce((acc: number, l: any) => acc + (l.questions || 0), 0);
        return (
          <div key={area.id} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <area.icon size={16} style={{ color: area.color }} />
              <span className="text-[10px] font-bold text-slate-400 uppercase truncate">{area.label}</span>
            </div>
            <div className="text-2xl font-black text-white">{pct}%</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-2">Revisões agendadas</div>
            <div className="w-full h-2 bg-slate-900 rounded-full mt-4 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: area.color }} />
            </div>
            <div className="text-[10px] text-slate-500 mt-3">{questoes} questões feitas</div>
          </div>
        );
      })}
    </div>
  );
};

const ReviewsView = ({ subjects, onReviewClick, quote, onShuffleQuote }: any) => {
  const getDaysDiff = (dateStr: string) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const target = new Date(dateStr); target.setHours(0,0,0,0);
    return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const reviews = useMemo(() => subjects.filter((s: any) => s.nextReview).map((s: any) => ({ ...s, days: getDaysDiff(s.nextReview) })).sort((a: any, b: any) => a.days - b.days), [subjects]);

  const overdue = reviews.filter((r: any) => r.days < 0);
  const todayReviews = reviews.filter((r: any) => r.days === 0);
  const upcoming = reviews.filter((r: any) => r.days > 0).slice(0, 10);

  return (
    <div className="space-y-6 animate-in slide-in-from-right-8">
       <div className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border border-blue-500/30 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="flex gap-4 items-center z-10">
            <div className="p-3 bg-blue-500/20 rounded-xl"><Sparkles size={24} className="text-blue-400" /></div>
            <div>
              <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1">Dose Diária</h3>
              <p className="text-lg font-medium text-white italic">"{quote}"</p>
            </div>
          </div>
          <button onClick={onShuffleQuote} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors z-10" title="Nova frase"><Shuffle size={18} /></button>
       </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 flex flex-col h-fit">
          <h3 className="text-red-400 font-bold flex items-center gap-2 mb-4"><AlertTriangle size={18} /> Atrasadas ({overdue.length})</h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {overdue.length === 0 ? <p className="text-slate-500 text-xs italic">Nada pendente.</p> : overdue.map((r: any) => (
              <div key={r.id} className="bg-red-900/10 border border-red-900/30 p-3 rounded-lg hover:bg-red-900/20 transition-colors cursor-pointer" onClick={() => onReviewClick(r)}>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-red-500 bg-red-900/30 px-2 py-0.5 rounded">{Math.abs(r.days)}d atrás</span>
                  <span className="text-[10px] text-slate-500">{getArea(r.area).label}</span>
                </div>
                <div className="text-sm font-medium text-red-100 mt-1 line-clamp-2">{r.topic}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/80 border border-cyan-500/30 rounded-2xl p-4 flex flex-col h-fit shadow-[0_0_20px_rgba(34,211,238,0.1)]">
          <h3 className="text-cyan-400 font-bold flex items-center gap-2 mb-4"><CalendarCheck size={18} /> Para Hoje ({todayReviews.length})</h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {todayReviews.length === 0 ? <p className="text-slate-500 text-xs italic">Em dia!</p> : todayReviews.map((r: any) => (
              <div key={r.id} className="bg-cyan-900/20 border border-cyan-500/30 p-4 rounded-lg hover:bg-cyan-900/30 transition-colors cursor-pointer group" onClick={() => onReviewClick(r)}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">{getArea(r.area).label}</span>
                  <Activity size={14} className="text-cyan-500 group-hover:scale-110 transition-transform"/>
                </div>
                <div className="text-sm font-bold text-white mb-2">{r.topic}</div>
                <div className="text-xs text-slate-400">Última nota: <span className="text-white">{r.accuracy}%</span></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 flex flex-col h-fit">
          <h3 className="text-blue-400 font-bold flex items-center gap-2 mb-4"><CalendarDays size={18} /> Próximas</h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {upcoming.length === 0 ? <p className="text-slate-500 text-xs italic">Vazio.</p> : upcoming.map((r: any) => (
              <div key={r.id} className="bg-slate-900/50 border border-slate-700 p-3 rounded-lg flex justify-between items-center transition-all hover:border-slate-500">
                <div className="w-2/3">
                  <div className="text-xs font-medium text-white truncate">{r.topic}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-500">{getArea(r.area).label}</span>
                    <span className="text-[9px] font-bold text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded border border-cyan-400/20">
                      {r.accuracy}% acerto
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-blue-400">Em {r.days}d</div>
                  <div className="text-[10px] text-slate-600">{new Date(r.nextReview).toLocaleDateString('pt-BR')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MockExamsView = ({ exams, setExams, subjects, onLinkReview }: any) => {
  const [form, setForm] = useState({ title: '', date: getLocalDate(), correct: '', total: '' });
  const [subjectSearch, setSubjectSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const filteredSubjects = subjects.filter((s: any) =>
    s.topic.toLowerCase().includes(subjectSearch.toLowerCase())
  ).slice(0, 30);

  const toggleSubject = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const addExam = (e: any) => {
    e.preventDefault();
    if (!form.title || !form.correct || !form.total) return;
    const newExam = {
      id: Date.now(),
      ...form,
      correct: parseInt(form.correct),
      total: parseInt(form.total),
      linkedSubjects: selectedIds
    };
    setExams([...exams, newExam]);

    if (selectedIds.length > 0) {
      onLinkReview(form.date, selectedIds, parseInt(form.correct), parseInt(form.total));
    }

    setForm({ title: '', date: getLocalDate(), correct: '', total: '' });
    setSelectedIds([]);
    setSubjectSearch('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <FileText className="text-purple-500" /> Registrar Simulado
        </h3>
        <form onSubmit={addExam} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm outline-none"
              placeholder="Prova / Instituição"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
            <input
              type="date"
              className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm outline-none"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
            />
            <div className="flex gap-2 md:col-span-2">
              <input
                type="number"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm outline-none"
                placeholder="Acertos"
                value={form.correct}
                onChange={e => setForm({ ...form, correct: e.target.value })}
              />
              <input
                type="number"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm outline-none"
                placeholder="Total"
                value={form.total}
                onChange={e => setForm({ ...form, total: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-slate-900/50 border border-cyan-900/40 rounded-xl p-4">
            <label className="text-xs font-bold text-cyan-400 uppercase block mb-2 flex items-center gap-2">
              <ListChecks size={14} /> Quais assuntos esse simulado cobriu? (opcional, mas recomendado)
            </label>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
              <input
                type="text"
                placeholder="Buscar assunto..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-cyan-500"
                value={subjectSearch}
                onChange={e => setSubjectSearch(e.target.value)}
              />
            </div>

            {selectedIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedIds.map(id => {
                  const sub = subjects.find((s: any) => s.id === id);
                  if (!sub) return null;
                  return (
                    <span key={id} className="flex items-center gap-1 bg-cyan-900/30 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold px-2 py-1 rounded-full">
                      {sub.topic}
                      <button type="button" onClick={() => toggleSubject(id)} className="hover:text-white">
                        <X size={10} />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {subjectSearch && (
              <div className="max-h-40 overflow-y-auto space-y-1 custom-scrollbar">
                {filteredSubjects.map((sub: any) => (
                  <button
                    type="button"
                    key={sub.id}
                    onClick={() => toggleSubject(sub.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex justify-between items-center transition-colors ${
                      selectedIds.includes(sub.id)
                        ? 'bg-cyan-600/20 border border-cyan-500/50 text-cyan-300'
                        : 'bg-slate-800 border border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <span>{sub.topic}</span>
                    <span className="text-[9px] text-slate-500 uppercase">{getArea(sub.area).label}</span>
                  </button>
                ))}
              </div>
            )}

            {selectedIds.length > 0 && (
              <p className="text-[10px] text-slate-500 mt-2">
                Ao salvar, esses {selectedIds.length} assunto(s) entram na fila de revisão espaçada com a nota deste simulado.
              </p>
            )}
          </div>

          <button type="submit" className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-purple-500 transition-colors">
            Salvar Simulado
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Award className="text-yellow-500" /> Histórico de Simulados
        </h3>
        {exams.sort((a: any, b: any) => b.date.localeCompare(a.date)).map((exam: any) => (
          <div key={exam.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex justify-between items-center">
            <div className="flex-1">
              <div className="text-xs text-slate-500 mb-1">{new Date(exam.date).toLocaleDateString('pt-BR')}</div>
              <h4 className="text-lg font-bold text-white">{exam.title}</h4>
              {exam.linkedSubjects?.length > 0 ? (
                <div className="text-[10px] text-cyan-400 font-bold mt-1 flex items-center gap-1">
                  <ListChecks size={12} /> {exam.linkedSubjects.length} assunto(s) agendado(s) para revisão
                </div>
              ) : (
                <div className="text-[10px] text-slate-600 italic mt-1">Sem revisão vinculada</div>
              )}
            </div>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-xs text-slate-500 uppercase">Nota</div>
                <div className={`text-2xl font-bold ${Math.round((exam.correct / exam.total) * 100) >= 80 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {Math.round((exam.correct / exam.total) * 100)}%
                </div>
              </div>
              <button onClick={() => setExams(exams.filter((e: any) => e.id !== exam.id))} className="text-slate-600 hover:text-red-400">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {exams.length === 0 && <p className="text-slate-500 italic text-center py-10">Nenhum simulado registrado ainda.</p>}
      </div>
    </div>
  );
};

const ReviewModal = ({ isOpen, onClose, onSave, subject }: any) => {
  const [total, setTotal] = useState(''); const [correct, setCorrect] = useState('');
  if (!isOpen || !subject) return null;
  const handleSubmit = () => { const t = parseInt(total), c = parseInt(correct); if (isNaN(t) || isNaN(c) || t === 0) return; onSave(subject.id, Math.round((c / t) * 100), subject.area, t); onClose(); setTotal(''); setCorrect(''); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"><div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl border-t-4 border-t-cyan-500 animate-in zoom-in duration-200"><h3 className="text-xl font-bold text-white mb-1">Registrar Revisão</h3><p className="text-slate-400 text-sm mb-6">Assunto: <span className="text-cyan-400 font-semibold">{subject.topic}</span></p><div className="space-y-4"><div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Questões Feitas</label><input type="number" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none" value={total} onChange={(e) => setTotal(e.target.value)} autoFocus /></div><div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Acertos</label><input type="number" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none" value={correct} onChange={(e) => setCorrect(e.target.value)} /></div></div><div className="flex gap-3 mt-8"><button onClick={onClose} className="flex-1 py-3 text-slate-400 hover:text-white text-sm font-bold">Cancelar</button><button onClick={handleSubmit} className="flex-1 bg-cyan-600 text-white rounded-lg py-3 text-sm font-bold">Salvar</button></div></div></div>
  );
};

const WeeklyPlanner = ({ tasks, setTasks }: any) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const daysOfWeek = useMemo(() => {
    const curr = new Date(); const dayOfWeek = curr.getDay(); const firstDay = new Date(curr);
    firstDay.setDate(curr.getDate() - dayOfWeek + (weekOffset * 7));
    const days = [];
    for (let i = 0; i < 7; i++) {
      const next = new Date(firstDay); next.setDate(firstDay.getDate() + i);
      days.push({ dateStr: getLocalDate(next), dayName: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i], dayNumber: next.getDate() });
    }
    return days;
  }, [weekOffset]);
  const [newTask, setNewTask] = useState(''); const [activeDay, setActiveDay] = useState(getLocalDate());
  useEffect(() => { const today = getLocalDate(); if (daysOfWeek.some(d => d.dateStr === today)) setActiveDay(today); else setActiveDay(daysOfWeek[0].dateStr); }, [weekOffset]);
  const addTask = (e: any) => { e.preventDefault(); if (!newTask.trim()) return; setTasks((prev: any) => ({ ...prev, [activeDay]: [...(prev[activeDay] || []), { id: Date.now(), text: newTask, done: false }] })); setNewTask(''); };
  const toggleTask = (day: string, taskId: number) => {
    setTasks((prev: any) => ({ ...prev, [day]: prev[day].map((t: any) => t.id === taskId ? { ...t, done: !t.done } : t) }));
  };
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-white flex items-center gap-2"><CalendarDays className="text-cyan-400" /> Cronograma Semanal</h3><div className="flex gap-2 items-center bg-slate-900 p-1 rounded-lg border border-slate-700"><button onClick={() => setWeekOffset(prev => prev - 1)} className="p-2 hover:bg-slate-700 rounded-md text-slate-300"><ChevronLeft size={16} /></button><span className="text-xs font-bold text-slate-400 uppercase w-32 text-center">{weekOffset === 0 ? "Esta Semana" : weekOffset === -1 ? "Semana Passada" : weekOffset === 1 ? "Próxima" : `${Math.abs(weekOffset)} semanas`}</span><button onClick={() => setWeekOffset(prev => prev + 1)} className="p-2 hover:bg-slate-700 rounded-md text-slate-300"><ChevronRight size={16} /></button></div></div>
        <div className="grid grid-cols-7 gap-2 mb-6">{daysOfWeek.map((d) => (<button key={d.dateStr} onClick={() => setActiveDay(d.dateStr)} className={`flex flex-col items-center p-2 rounded-xl border transition-all ${activeDay === d.dateStr ? 'bg-cyan-600 border-cyan-500 text-white shadow-lg' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'} ${d.dateStr === getLocalDate() ? 'ring-2 ring-purple-500' : ''}`}><span className="text-[9px] font-bold uppercase">{d.dayName}</span><span className="text-lg font-bold">{d.dayNumber}</span>{(tasks[d.dateStr] || []).length > 0 && <div className={`mt-1 w-1.5 h-1.5 rounded-full ${tasks[d.dateStr].some((t: any) => !t.done) ? 'bg-orange-500' : 'bg-emerald-500'}`}></div>}</button>))}</div>
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 min-h-[250px]"><span className="text-sm font-bold text-slate-400 block mb-4">Tarefas de {activeDay.split('-').reverse().join('/')}</span>
          <form onSubmit={addTask} className="flex gap-2 mb-4"><input type="text" className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-cyan-500 outline-none" placeholder="Adicionar tarefa..." value={newTask} onChange={(e) => setNewTask(e.target.value)} /><button type="submit" className="bg-cyan-600 p-3 rounded-lg"><Sparkles size={18} /></button></form>
          <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">{(!tasks[activeDay] || tasks[activeDay].length === 0) && <div className="text-center py-8 text-slate-600 italic text-sm">Sem tarefas.</div>}{tasks[activeDay]?.map((task: any) => (<div key={task.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-all group ${task.done ? 'bg-slate-800/30 border-slate-800 opacity-60' : 'bg-slate-800 border-slate-700 hover:border-slate-600'}`}><button onClick={() => toggleTask(activeDay, task.id)} className={`w-6 h-6 rounded border flex items-center justify-center ${task.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-500 text-transparent'}`}><CheckSquare size={14} /></button><span className={`flex-1 text-sm select-none ${task.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>{task.text}</span><button onClick={() => setTasks((prev: any) => ({ ...prev, [activeDay]: prev[activeDay].filter((t: any) => t.id !== task.id) }))} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button></div>))}</div>
        </div>
      </div>
    </div>
  );
};

const MonthlyView = ({ dailyStats }: any) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const days = useMemo(() => {
    const year = currentDate.getFullYear(); const month = currentDate.getMonth(); const totalDays = new Date(year, month + 1, 0).getDate(); const firstDay = new Date(year, month, 1).getDay();
    const daysArr: (string | null)[] = Array(firstDay).fill(null);
    for(let i = 1; i <= totalDays; i++) daysArr.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`);
    return daysArr;
  }, [currentDate]);
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-white flex items-center gap-2"><CalendarCheck className="text-purple-400" /> {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3><div className="flex gap-2"><button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700"><ChevronLeft size={16} /></button><button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700"><ChevronRight size={16} /></button></div></div>
        <div className="grid grid-cols-7 gap-2 mb-2">{['D','S','T','Q','Q','S','S'].map((d, i) => <div key={i} className="text-center text-xs font-bold text-slate-500">{d}</div>)}</div>
        <div className="grid grid-cols-7 gap-2">
            {days.map((dateStr, idx) => {
                if(!dateStr) return <div key={idx} className="aspect-square"></div>;
                const data = dailyStats.find((d: any) => d.date === dateStr);
                return (<div key={idx} className={`aspect-square rounded-lg border flex flex-col items-center justify-center relative group transition-all ${data ? 'bg-slate-800 border-slate-600' : 'bg-slate-900/50 border-slate-800'} ${dateStr === getLocalDate() ? 'ring-1 ring-cyan-400' : ''}`}><span className={`text-sm font-bold ${data ? 'text-white' : 'text-slate-600'}`}>{parseInt(dateStr.split('-')[2])}</span>{data?.questions > 0 && <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1"></div>}</div>);
            })}
        </div>
    </div>
  );
};

const LogoErreUm = ({ showSubtitle = true }: any) => {
  return (
    <div className="flex items-center gap-3 select-none"><div className="relative group"><div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div><div className="relative w-11 h-11 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800/50 shadow-xl ring-1 ring-white/10"><Brain className="text-white group-hover:scale-110 transition-transform duration-300" size={24} /></div></div><div className="flex flex-col -space-y-1"><h1 className="text-2xl tracking-tight flex items-baseline"><span className="font-bold text-slate-300">Erre</span><span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">Um</span></h1>{showSubtitle && (<span className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest leading-tight">Internato | Projeto R1</span>)}</div></div>
  );
};

const AuthScreen = ({ onLogin }: any) => {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [loading, setLoading] = useState(false); const [isSignUp, setIsSignUp] = useState(false); const [msg, setMsg] = useState('');
  const handleAuth = async (e: any) => {
    e.preventDefault(); setLoading(true); setMsg('');
    try { const { data, error } = isSignUp ? await supabase.auth.signUp({ email, password }) : await supabase.auth.signInWithPassword({ email, password }); if (error) throw error; if (isSignUp) { setMsg('Conta criada! Faça login.'); setIsSignUp(false); } else onLogin(data.session); } catch (error: any) { setMsg(error.message); } finally { setLoading(false); }
  };
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4"><div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden"><div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-500"></div><div className="flex justify-center mb-8 mt-2"><LogoErreUm showSubtitle={false} /></div><p className="text-center text-slate-400 mb-6 text-sm">Sua jornada rumo à residência médica.</p><form onSubmit={handleAuth} className="space-y-4"><div><label className="text-xs text-slate-500 font-bold uppercase">Email</label><input type="email" required className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white mt-1 outline-none focus:border-purple-500" value={email} onChange={e => setEmail(e.target.value)}/></div><div><label className="text-xs text-slate-500 font-bold uppercase">Senha</label><input type="password" required className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white mt-1 outline-none focus:border-purple-500" value={password} onChange={e => setPassword(e.target.value)}/></div>{msg && <p className="text-center text-sm text-yellow-400 bg-yellow-900/20 p-2 rounded">{msg}</p>}<button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 rounded-lg hover:opacity-90 flex justify-center gap-2">{loading && <Loader2 className="animate-spin" size={18} />}{isSignUp ? 'Criar Conta' : 'Entrar'}</button></form><div className="mt-6 text-center"><button onClick={() => { setIsSignUp(!isSignUp); setMsg(''); }} className="text-slate-400 text-sm hover:text-white underline">{isSignUp ? 'Fazer Login' : 'Criar conta'}</button></div></div></div>
  );
};

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState({ name: 'Doutor(a)', xp: 0, level: 1, streak: 0, lastActiveDate: null as string | null });
  const [subjects, setSubjects] = useState<any[]>([]);
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [manualPerformance, setManualPerformance] = useState<any[]>([]);
  const [weeklyTasks, setWeeklyTasks] = useState<any>({});
  const [reviewHistory, setReviewHistory] = useState<any[]>([]);
  const [mockExams, setMockExams] = useState<any[]>([]);

  // Inputs Dashboard (Registro Rápido)
  const [inputDate, setInputDate] = useState(getLocalDate());
  const [inputArea, setInputArea] = useState('clinica');
  const [inputSubTopic, setInputSubTopic] = useState('');
  const [inputSimulado, setInputSimulado] = useState('');
  const [inputCorrect, setInputCorrect] = useState('');
  const [inputTotal, setInputTotal] = useState('');

  const statsMetrics = useMemo(() => {
    const today = getLocalDate();
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfWeekStr = getLocalDate(startOfWeek);
    const startOfMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const startOfYearStr = `${now.getFullYear()}-01-01`;

    return {
      hoje: dailyStats.find(d => d.date === today)?.questions || 0,
      semana: dailyStats.filter(d => d.date >= startOfWeekStr).reduce((acc, curr) => acc + (curr.questions || 0), 0),
      mes: dailyStats.filter(d => d.date >= startOfMonthStr).reduce((acc, curr) => acc + (curr.questions || 0), 0),
      ano: dailyStats.filter(d => d.date >= startOfYearStr).reduce((acc, curr) => acc + (curr.questions || 0), 0),
      total: dailyStats.reduce((acc, curr) => acc + (curr.questions || 0), 0)
    };
  }, [dailyStats]);

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('AREAS');
  const [filterArea, setFilterArea] = useState('cirurgia');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [isReviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [dailyQuote, setDailyQuote] = useState('');

  const recalculateStreak = (allStats: any[]) => {
    if (!allStats || allStats.length === 0) return 0;
    const activeDates = allStats.filter(s => s.questions > 0).map(s => s.date).sort((a, b) => b.localeCompare(a));
    if (activeDates.length === 0) return 0;
    const today = getLocalDate();
    const d = new Date(); d.setDate(d.getDate() - 1);
    const yesterday = getLocalDate(d);
    if (activeDates[0] !== today && activeDates[0] !== yesterday) return 0;
    let streak = 0; let checkDate = new Date(activeDates[0] + 'T12:00:00');
    while (true) {
      const dateStr = getLocalDate(checkDate);
      if (activeDates.includes(dateStr)) { streak++; checkDate.setDate(checkDate.getDate() - 1); }
      else break;
    }
    return streak;
  };

  const clearSessionData = () => {
    setUser({ name: 'Doutor(a)', xp: 0, level: 1, streak: 0, lastActiveDate: null });
    setSubjects(FULL_SUBJECTS_LIST); setDailyStats([]); setManualPerformance([]); setWeeklyTasks({}); setReviewHistory([]); setMockExams([]);
    setInputCorrect(''); setInputTotal(''); setInputSubTopic(''); setInputSimulado('');
  };

  useEffect(() => {
    let mounted = true;
    async function getInitialSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) { if (session) { setSession(session); await carregarDados(session.user.id); } else setLoadingData(false); }
    }
    getInitialSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) { setSession(session); if (event === 'SIGNED_IN' && session) carregarDados(session.user.id); else if (event === 'SIGNED_OUT') { clearSessionData(); setLoadingData(false); setSession(null); } }
    });
    setDailyQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  async function carregarDados(userId: string) {
    setLoadingData(true);
    try {
      const { data } = await supabase.from('profiles').select('dados_app').eq('id', userId).single();
      if (data?.dados_app) {
        const s = data.dados_app;
        setUser(s.user || user);
        setDailyStats(s.dailyStats || []);
        setManualPerformance(s.manualPerformance || []);
        setReviewHistory(s.reviewHistory || []);
        setWeeklyTasks(s.weeklyTasks || {});
        setMockExams(s.mockExams || []);
        setSubjects(FULL_SUBJECTS_LIST.map(staticSub => {
            const saved = (s.subjects || []).find((ss: any) => ss.id === staticSub.id);
            return saved ? { ...staticSub, ...foundExact(saved) } : staticSub;
        }));
        function foundExact(saved: any) { return { watched: saved.watched ?? false, read: saved.read ?? false, accuracy: saved.accuracy ?? 0, nextReview: saved.nextReview ?? null }; }
      }
    } catch (e) { console.error(e); } finally { setLoadingData(false); }
  }

  const saveTimeout = useRef<any>(null);
  useEffect(() => {
    if (!session || loadingData) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
        await supabase.from('profiles').upsert({ id: session.user.id, dados_app: { user, subjects, dailyStats, manualPerformance, weeklyTasks, reviewHistory, mockExams }, updated_at: new Date() });
    }, 2000);
  }, [user, subjects, dailyStats, manualPerformance, weeklyTasks, reviewHistory, mockExams, session, loadingData]);

  const handleDailySave = () => {
    const totalQ = parseInt(inputTotal) || 0;
    const correctQ = parseInt(inputCorrect) || 0;

    if (totalQ === 0) return alert("Insira o total de questões.");

    const calculatedAccuracy = Math.round((correctQ / totalQ) * 100);

    const newStats = [...dailyStats];
    const idx = newStats.findIndex(d => d.date === inputDate);
    if (idx >= 0) newStats[idx].questions += totalQ;
    else newStats.push({ date: inputDate, questions: totalQ });

    let tituloFinal = inputSubTopic || 'Geral';
    if (inputArea === 'simulado' || inputSimulado) {
        tituloFinal = inputSimulado ? `SIMULADO: ${inputSimulado}` : 'Simulado Geral';
    }

    const registroPerformance = { id: Date.now(), date: inputDate, area: inputArea, subtopic: tituloFinal, accuracy: calculatedAccuracy, questions: totalQ };

    setDailyStats(newStats);
    setManualPerformance([...manualPerformance, registroPerformance]);

    const streak = recalculateStreak(newStats);
    const xp = (totalQ * 10) + (calculatedAccuracy >= 80 ? 100 : 50);
    setUser(prev => ({ ...prev, xp: prev.xp + xp, level: Math.floor((prev.xp + xp) / 1000) + 1, streak }));

    alert(`Salvo com sucesso!`);
    setInputCorrect(''); setInputTotal(''); setInputSubTopic(''); setInputSimulado('');
  };

  const resetDay = () => {
    if(!confirm(`Deseja zerar os registros de ${inputDate}?`)) return;
    const filteredStats = dailyStats.filter(d => d.date !== inputDate);
    const filteredManual = manualPerformance.filter(l => l.date !== inputDate);
    setDailyStats(filteredStats); setManualPerformance(filteredManual);
    setUser(prev => ({ ...prev, streak: recalculateStreak(filteredStats) }));
  };

  const addXP = (amount: number) => setUser(prev => ({ ...prev, xp: prev.xp + amount, level: Math.floor((prev.xp + amount) / 1000) + 1 }));
  const toggleSubjectCheck = (id: number, field: string) => { setSubjects(prev => prev.map(sub => { if (sub.id === id) { const newVal = !sub[field]; if (newVal) addXP(10); return { ...sub, [field]: newVal }; } return sub; })); };

  const handleReviewSave = (id: number, accuracy: number, area: string, totalQuestions: number) => {
    const todayObj = new Date();
    let nextDate = new Date();
    const todayStr = getLocalDate();

    if (accuracy < 50) nextDate.setDate(todayObj.getDate() + 3);
    else if (accuracy < 75) nextDate.setDate(todayObj.getDate() + 7);
    else if (accuracy < 90) nextDate.setDate(todayObj.getDate() + 21);
    else nextDate.setDate(todayObj.getDate() + 60);

    setSubjects(prev => prev.map(sub => sub.id === id ? { ...sub, accuracy, nextReview: nextDate.toISOString() } : sub));
    setReviewHistory(prev => [...prev, { id: Date.now(), subjectId: id, date: new Date().toISOString(), accuracy, area }]);

    setDailyStats(prev => {
      const existing = prev.find(d => d.date === todayStr);
      let newStats = existing ? prev.map(d => d.date === todayStr ? { ...d, questions: d.questions + totalQuestions } : d) : [...prev, { date: todayStr, questions: totalQuestions }];
      setUser(u => ({ ...u, streak: recalculateStreak(newStats), lastActiveDate: todayStr }));
      return newStats;
    });

    setReviewModalOpen(false);
    addXP(100);
  };

  const linkExamToReviews = (examDate: string, selectedSubjectIds: number[], correct: number, total: number) => {
    if (selectedSubjectIds.length === 0) return;
    const accuracy = Math.round((correct / total) * 100);
    const baseDate = new Date(examDate + 'T12:00:00');
    let nextDate = new Date(baseDate);

    if (accuracy < 50) nextDate.setDate(baseDate.getDate() + 3);
    else if (accuracy < 75) nextDate.setDate(baseDate.getDate() + 7);
    else if (accuracy < 90) nextDate.setDate(baseDate.getDate() + 21);
    else nextDate.setDate(baseDate.getDate() + 60);

    setSubjects(prev => prev.map(sub => selectedSubjectIds.includes(sub.id) ? { ...sub, accuracy, nextReview: nextDate.toISOString() } : sub));

    setReviewHistory(prev => [
      ...prev,
      ...selectedSubjectIds.map(id => {
        const sub = subjects.find(s => s.id === id);
        return { id: Date.now() + id, subjectId: id, date: new Date().toISOString(), accuracy, area: sub?.area, source: 'simulado' };
      })
    ]);

    setDailyStats(prev => {
      const existing = prev.find(d => d.date === examDate);
      const newStats = existing
        ? prev.map(d => d.date === examDate ? { ...d, questions: d.questions + total } : d)
        : [...prev, { date: examDate, questions: total, flashcards: 0 }];
      setUser(u => ({ ...u, streak: recalculateStreak(newStats) }));
      return newStats;
    });

    addXP(selectedSubjectIds.length * 50 + 100);
  };

  const clearReview = (id: number) => {
    if(!confirm("Remover agendamento de revisão?")) return;
    setSubjects(prev => prev.map(sub => sub.id === id ? { ...sub, nextReview: null, accuracy: 0 } : sub));
  };

  if (!session) return <AuthScreen onLogin={setSession} />;
  if (loadingData) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white"><Loader2 className="animate-spin" /></div>;

  const overdueCount = subjects.filter(s => s.nextReview && new Date(s.nextReview).setHours(0,0,0,0) < new Date().setHours(0,0,0,0)).length;

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 font-sans selection:bg-purple-500/30">
     <ReviewModal isOpen={isReviewModalOpen} onClose={() => setReviewModalOpen(false)} onSave={handleReviewSave} subject={selectedSubject} />

      <header className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-40 h-16 flex items-center justify-between px-4 max-w-7xl mx-auto shadow-sm">
          <LogoErreUm showSubtitle={true} />
          <div className="flex items-center gap-6">
            {overdueCount > 0 && (
              <button onClick={() => setActiveTab('revisoes')} className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-500/50 bg-red-900/20 text-red-400 text-xs font-bold hover:bg-red-900/40 transition-colors">
                <AlertTriangle size={14} /> {overdueCount} atrasada{overdueCount > 1 ? 's' : ''}
              </button>
            )}
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${user.streak > 0 ? 'bg-orange-900/20 border-orange-500/50 text-orange-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}><Flame size={18} className={user.streak > 0 ? "fill-orange-500 animate-pulse" : ""} /><span className="text-sm font-bold">{user.streak} dias</span></div>
            <div className="hidden sm:block text-right"><div className="text-xs text-slate-400">Nível {user.level}</div><div className="text-sm font-bold text-white">{user.xp} XP</div></div>
            <button onClick={() => supabase.auth.signOut()} className="p-2 bg-slate-800 rounded-lg hover:text-red-400 transition-colors"><LogOut size={18} /></button>
          </div>
      </header>

      <nav className="fixed bottom-0 left-0 w-full bg-slate-900 border-t border-slate-800 sm:static sm:border-b sm:mb-8 z-40 shadow-2xl"><div className="max-w-7xl mx-auto px-4 flex justify-around sm:justify-start sm:gap-8 h-16 sm:h-12 items-center">
            {[
                { id: 'dashboard', label: 'Estudo', icon: LayoutDashboard },
                { id: 'performance', label: 'Acertos', icon: BarChart3 },
                { id: 'revisoes', label: 'Revisões', icon: ListChecks },
                { id: 'month', label: 'Calendário', icon: CalendarDays },
                { id: 'simulados', label: 'Simulados', icon: Award },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2 h-full px-2 sm:px-4 border-t-2 sm:border-t-0 sm:border-b-2 transition-all ${activeTab === tab.id ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-500'}`}><tab.icon size={18} /><span className="text-[10px] sm:text-xs font-medium uppercase tracking-widest">{tab.label}</span></button>
            ))}
      </div></nav>

      <main className="max-w-7xl mx-auto px-4 pb-24 pt-6">
        {activeTab === 'performance' && (
          <PerformanceView manualPerformance={manualPerformance} setManualPerformance={setManualPerformance} />
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Hoje', val: statsMetrics.hoje, icon: Activity, color: 'text-cyan-400' },
                { label: 'Semana', val: statsMetrics.semana, icon: CalendarCheck, color: 'text-purple-400' },
                { label: 'Mês', val: statsMetrics.mes, icon: BarChart3, color: 'text-blue-400' },
                { label: 'Ano', val: statsMetrics.ano, icon: TrendingUp, color: 'text-emerald-400' },
                { label: 'Total', val: statsMetrics.total, icon: Award, color: 'text-orange-400' }
              ].map((stat, i) => (
                <div key={i} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex flex-col justify-between shadow-md group hover:border-slate-500 transition-all">
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{stat.label}</p>
                    <stat.icon className={stat.color} size={16} />
                  </div>
                  <p className="text-2xl font-black text-white mt-2">{stat.val.toLocaleString('pt-BR')}</p>
                </div>
              ))}
            </div>

            <AreaOverviewCards subjects={subjects} manualPerformance={manualPerformance} />

            <WeeklyPlanner tasks={weeklyTasks} setTasks={setWeeklyTasks} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl shadow-sm">
                <h3 className="text-slate-300 font-semibold mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2"><Activity size={18} className="text-cyan-400" /> Registro Rápido</span>
                  <div className="flex gap-2">
                    <button onClick={resetDay} title="Zerar dia" className="text-red-400 hover:text-red-300"><RotateCcw size={14} /></button>
                    <input type="date" value={inputDate} onChange={e => setInputDate(e.target.value)} className="bg-slate-900 border border-slate-700 text-[10px] text-cyan-400 rounded px-2 py-1 outline-none" />
                  </div>
                </h3>

                <div className="space-y-3 mb-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Área</label>
                      <select value={inputArea} onChange={e => setInputArea(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2 text-xs outline-none focus:border-cyan-500">
                        {Object.values(AREAS).map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-purple-400 font-bold uppercase block mb-1">Simulado (Opcional)</label>
                      <input type="text" value={inputSimulado} onChange={e => setInputSimulado(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2 text-xs outline-none focus:border-purple-500" placeholder="Nome da prova" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Assunto Específico</label>
                    <input type="text" value={inputSubTopic} onChange={e => setInputSubTopic(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2 text-xs outline-none focus:border-cyan-500" placeholder="Ex: Doença de Crohn" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-emerald-500 font-bold uppercase block mb-1">Acertos</label>
                      <input type="number" value={inputCorrect} onChange={e => setInputCorrect(e.target.value)} className="w-full bg-slate-900 border border-emerald-900/50 text-emerald-400 rounded-lg p-2.5 text-center outline-none focus:border-emerald-500" placeholder="0" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Total Qts</label>
                      <input type="number" value={inputTotal} onChange={e => setInputTotal(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 text-center outline-none focus:border-cyan-500" placeholder="0" />
                    </div>
                  </div>
                  {Number(inputTotal) > 0 && (
                    <div className="text-center py-2 bg-slate-900/80 rounded-xl border border-slate-700">
                      <span className="text-[10px] text-slate-500 uppercase font-bold mr-2">Aproveitamento:</span>
                      <span className={`text-sm font-black ${Math.round((Number(inputCorrect)/Number(inputTotal))*100) >= 80 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                        {Math.round((Number(inputCorrect)/Number(inputTotal))*100)}%
                      </span>
                    </div>
                  )}
                </div>
                <button onClick={handleDailySave} className="w-full bg-cyan-600 text-white text-sm font-bold py-3 rounded-lg shadow-lg hover:bg-cyan-500 active:scale-95 transition-all">Salvar e Registrar Performance</button>
              </div>

              <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 p-6 rounded-2xl shadow-xl flex flex-col gap-6">
                <QuestionsHeatmap data={dailyStats} />
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800 sticky top-16 z-30 backdrop-blur-md">
              <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-700 w-full md:w-auto">
                  <button onClick={() => setViewMode('AREAS')} className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-md transition-all ${viewMode === 'AREAS' ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Por Áreas</button>
                  <button onClick={() => setViewMode('BLOCKS')} className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-md transition-all ${viewMode === 'BLOCKS' ? 'bg-cyan-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Por Blocos</button>
                </div>

                {viewMode === 'AREAS' && (
                  <div className="flex overflow-x-auto pb-1 gap-2 scrollbar-hide w-full md:w-auto justify-start border-l border-slate-800 pl-4">
                    {Object.values(AREAS).map((area) => (
                      <button key={area.id} onClick={() => setFilterArea(area.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full whitespace-nowrap text-[10px] font-bold transition-all ${filterArea === area.id ? 'bg-purple-600 text-white ring-2 ring-purple-400' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                        <area.icon size={12} /> {area.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-sm outline-none focus:border-cyan-500">
                  <option value="ALL">Todas Prioridades</option>
                  {Object.entries(PRIORITIES).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}
                </select>
                <div className="relative w-full md:w-48">
                  <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                  <input type="text" placeholder="Buscar assunto..." className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:border-cyan-500 outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden overflow-x-auto shadow-2xl">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-900/80 text-xs uppercase text-slate-500 border-b border-slate-700">
                  <tr><th className="px-6 py-4">Prioridade</th><th className="px-6 py-4 w-1/3">Assunto</th><th className="px-6 py-4 text-center">Progresso</th><th className="px-6 py-4 text-center">Revisão</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {(() => {
                    let list = subjects.filter(s => (s.topic || "").toLowerCase().includes(searchTerm.toLowerCase()) && (filterPriority === 'ALL' || s.priority === filterPriority));
                    if (viewMode === 'AREAS') list = list.filter(s => s.area === filterArea);
                    else list = list.sort((a,b) => a.id - b.id);
                    return list.map((sub, index) => {
                      const pStyle = getPriority(sub.priority);
                      const blockNum = Math.floor(sub.id / 100);
                      const prevBlock = index > 0 ? Math.floor(list[index-1].id / 100) : 0;
                      return (
                        <React.Fragment key={sub.id}>
                          {viewMode === 'BLOCKS' && blockNum !== prevBlock && (
                            <tr className="bg-slate-950/50"><td colSpan={4} className="px-6 py-2 text-cyan-400 font-bold uppercase text-[10px] tracking-widest">📍 Bloco {blockNum}</td></tr>
                          )}
                          <tr className="hover:bg-slate-800/80 transition-colors">
                            <td className="px-6 py-4"><span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase ${pStyle.color}`}>{pStyle.label}</span></td>
                            <td className="px-6 py-4"><div className="font-medium text-slate-200">{sub.topic}</div></td>
                            <td className="px-6 py-4"><div className="flex justify-center gap-3">
                              {['watched', 'read'].map(f => (
                                <button key={f} onClick={() => toggleSubjectCheck(sub.id, f)} className={`flex flex-col items-center justify-center w-10 h-10 rounded-lg border transition-all ${sub[f] ? 'bg-purple-600/20 text-purple-400 border border-purple-500/50' : 'border-slate-700 bg-slate-900 text-slate-600 hover:border-slate-500'}`}>
                                  {f === 'watched' ? <Play size={14} /> : <CheckSquare size={14} />}
                                </button>
                              ))}
                            </div></td>
                            <td className="px-6 py-4 text-center">
  {(() => {
    if (!sub.nextReview) {
      return (
        <button onClick={() => { setSelectedSubject(sub); setReviewModalOpen(true); }} className="text-xs bg-slate-800 border border-slate-600 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-md transition-colors shadow-sm">
          Agendar
        </button>
      );
    }
    const diffTime = new Date(sub.nextReview).getTime() - new Date().setHours(0,0,0,0);
    const daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return (
      <div className="flex flex-col items-center gap-1 animate-in fade-in">
        <span className={`text-[10px] font-black uppercase tracking-wider ${daysDiff <= 0 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
          {daysDiff < 0 ? `${Math.abs(daysDiff)}d atrasado` : daysDiff === 0 ? 'Hoje!' : `${daysDiff} dias`}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={() => { setSelectedSubject(sub); setReviewModalOpen(true); }} className="text-[10px] bg-slate-800/80 border border-slate-700 hover:border-slate-500 text-white px-2 py-1 rounded transition-all font-bold">
            Revisar
          </button>
          <button onClick={() => clearReview(sub.id)} className="p-1 text-slate-600 hover:text-red-400 transition-colors" title="Limpar agendamento">
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    );
  })()}
</td>
                          </tr>
                        </React.Fragment>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'month' && <MonthlyView dailyStats={dailyStats} />}
        {activeTab === 'simulados' && <MockExamsView exams={mockExams} setExams={setMockExams} subjects={subjects} onLinkReview={linkExamToReviews} />}
        {activeTab === 'revisoes' && <ReviewsView subjects={subjects} onReviewClick={(sub: any) => { setSelectedSubject(sub); setReviewModalOpen(true); }} quote={dailyQuote} onShuffleQuote={() => setDailyQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)])} />}
      </main>

      <footer className="py-10 text-center opacity-30 text-[10px] uppercase tracking-widest font-bold">Criado por Alus Harã</footer>
    </div>
  );
}
