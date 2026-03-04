import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oqiylgyeibybhxnrftmg.supabase.co'
const supabaseKey = 'sb_publishable_eWpmMKR56Itp1npbuW6Pjw_oQ9SEFyJ'

export const supabase = createClient(supabaseUrl, supabaseKey)

export const SEED_DATA = [
  {
    front: 'Was ist Supervised Learning?',
    back: 'Lernverfahren mit beschrifteten Trainingsdaten – das Modell lernt eine Eingabe-Ausgabe-Abbildung anhand von Beispielen.',
    topic: 'Machine Learning',
  },
  {
    front: 'Was ist ein Gradient Descent?',
    back: 'Optimierungsalgorithmus, der iterativ in Richtung des steilsten Abstiegs der Verlustfunktion geht, um Modellparameter zu minimieren.',
    topic: 'Machine Learning',
  },
  {
    front: 'Was ist Overfitting?',
    back: 'Das Modell lernt die Trainingsdaten zu gut – inkl. Rauschen – und generalisiert schlecht auf neue Daten.',
    topic: 'Machine Learning',
  },
  {
    front: 'Was ist ein neuronales Netz?',
    back: 'Schichtenweise verbundene künstliche Neuronen, inspiriert vom menschlichen Gehirn, zur Mustererkennung.',
    topic: 'Machine Learning',
  },
  {
    front: 'Was ist der Unterschied zwischen Classification und Regression?',
    back: 'Classification: diskrete Ausgabe (Kategorien). Regression: kontinuierliche Ausgabe (Zahlen).',
    topic: 'Machine Learning',
  },
  {
    front: 'Was ist ein Transformer?',
    back: 'Architektur basierend auf Self-Attention-Mechanismen, Grundlage moderner LLMs wie GPT und BERT.',
    topic: 'Machine Learning',
  },
  {
    front: 'Was ist Regularisierung?',
    back: 'Technik zur Vermeidung von Overfitting durch Hinzufügen eines Strafterms zur Verlustfunktion (z.B. L1, L2).',
    topic: 'Machine Learning',
  },
  {
    front: 'Was ist ein Hyperparameter?',
    back: 'Parameter, der vor dem Training gesetzt wird und nicht gelernt wird – z.B. Lernrate, Batch-Size, Anzahl Layer.',
    topic: 'Machine Learning',
  },
  {
    front: 'Was ist Cross-Validation?',
    back: 'Evaluierungsmethode, bei der Daten in k Folds aufgeteilt werden, um Modellperformance robuster zu schätzen.',
    topic: 'Machine Learning',
  },
  {
    front: 'Was ist ein Embedding?',
    back: 'Dichte Vektorrepräsentation von Objekten (z.B. Wörter, Nutzer) in einem kontinuierlichen Vektorraum.',
    topic: 'Machine Learning',
  },
]
