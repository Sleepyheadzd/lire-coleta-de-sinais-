import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Volume2, ArrowLeft } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";

const categories = ["Todos", "Dislexia", "TDAH", "Autismo", "Surdez"];

const articles = [
  {
    id: 1,
    title: "Entendendo a Dislexia: Mitos e Verdades",
    excerpt: "A dislexia é um transtorno de aprendizagem que afeta a capacidade de leitura. Descubra o que é real e o que é mito.",
    category: "Dislexia",
    readTime: "5 min",
    content: "A dislexia é um dos transtornos de aprendizagem mais comuns, afetando aproximadamente 5 a 10% da população mundial. Apesar de sua prevalência, muitos mitos ainda cercam este tema.\n\nMito 1: Pessoas com dislexia são menos inteligentes.\nVerdade: A dislexia não está relacionada à inteligência. Muitas pessoas brilhantes, como Albert Einstein e Steve Jobs, eram disléxicas.\n\nMito 2: Dislexia é apenas inverter letras.\nVerdade: Embora a inversão de letras seja um sintoma, a dislexia envolve dificuldades mais amplas com processamento fonológico.\n\nCom as ferramentas certas e apoio adequado, pessoas com dislexia podem alcançar grande sucesso acadêmico e profissional.",
  },
  {
    id: 2,
    title: "TDAH e Estratégias de Foco na Leitura",
    excerpt: "Técnicas comprovadas para melhorar a concentração durante a leitura para pessoas com TDAH.",
    category: "TDAH",
    readTime: "4 min",
    content: "O Transtorno de Déficit de Atenção com Hiperatividade (TDAH) pode tornar a leitura uma tarefa desafiadora. Porém, existem estratégias eficazes que podem ajudar.\n\n1. Modo foco: Destaque apenas o parágrafo que está lendo.\n2. Leitura em voz alta: Usar TTS pode ajudar a manter a atenção.\n3. Pausas regulares: Faça intervalos curtos a cada 15-20 minutos.\n4. Ambiente: Minimize distrações visuais e sonoras.",
  },
  {
    id: 3,
    title: "Tecnologia Assistiva para Pessoas Surdas",
    excerpt: "Como a tecnologia está revolucionando a comunicação para a comunidade surda.",
    category: "Surdez",
    readTime: "6 min",
    content: "A tecnologia assistiva tem transformado a vida de pessoas surdas de maneiras extraordinárias.\n\nAvatares 3D que traduzem texto para Libras em tempo real, reconhecimento de gestos por câmera e sistemas de comunicação remota são apenas algumas das inovações disponíveis.\n\nEssas ferramentas não substituem a comunicação humana, mas ampliam as possibilidades de interação e inclusão social.",
  },
  {
    id: 4,
    title: "Autismo e Personalização de Interface",
    excerpt: "Por que interfaces adaptativas são importantes para pessoas no espectro autista.",
    category: "Autismo",
    readTime: "5 min",
    content: "Pessoas no espectro autista frequentemente têm sensibilidades sensoriais que tornam interfaces convencionais desconfortáveis.\n\nPersonalização de cores, redução de animações, fontes claras e layouts previsíveis podem fazer uma grande diferença na experiência de uso.\n\nO design inclusivo beneficia não apenas pessoas autistas, mas todos os usuários.",
  },
];

const BlogPage = () => {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [selectedArticle, setSelectedArticle] = useState<typeof articles[0] | null>(null);

  const filtered = activeCategory === "Todos"
    ? articles
    : articles.filter((a) => a.category === activeCategory);

  if (selectedArticle) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setSelectedArticle(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao blog
          </button>
          <motion.article initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Badge className="mb-3">{selectedArticle.category}</Badge>
            <h1 className="text-3xl font-bold mb-4">{selectedArticle.title}</h1>
            <div className="flex gap-3 mb-6">
              <button className="px-3 py-1.5 rounded-lg bg-muted text-sm flex items-center gap-1.5 hover:bg-muted/80 transition-colors">
                <Volume2 className="w-4 h-4" /> Ouvir artigo
              </button>
            </div>
            <div className="prose prose-lg whitespace-pre-line text-foreground leading-relaxed">
              {selectedArticle.content}
            </div>
          </motion.article>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Blog</h1>
          <p className="text-muted-foreground">Artigos sobre acessibilidade e inclusão</p>
        </motion.div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "gradient-warm text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid gap-4">
          {filtered.map((article, i) => (
            <motion.button
              key={article.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedArticle(article)}
              className="p-6 rounded-2xl bg-card border hover:shadow-md transition-shadow text-left w-full"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge variant="secondary" className="mb-2">{article.category}</Badge>
                  <h3 className="font-semibold text-lg mb-1">{article.title}</h3>
                  <p className="text-muted-foreground text-sm">{article.excerpt}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{article.readTime}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BlogPage;
