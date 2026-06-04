import { supabase } from '../../config/supabase';
import { createError } from '../../middleware/error.middleware';

export async function getPublicFAQs() {
  const { data, error } = await supabase
    .from('faqs')
    .select('id, question, answer, keywords')
    .eq('is_active', true)
    .order('question', { ascending: true });
  if (error) throw createError('Failed to fetch FAQs', 500);
  return data;
}

export async function answerQuestion(question: string) {
  const { data: faqs } = await supabase
    .from('faqs')
    .select('question, answer, keywords')
    .eq('is_active', true);

  if (!faqs || faqs.length === 0) {
    return { answer: "I'm sorry, I don't have an answer for that right now. Please contact the clinic directly." };
  }

  const lower = question.toLowerCase();

  // Score each FAQ by keyword + question word matches
  const scored = faqs.map((faq) => {
    let score = 0;
    (faq.keywords ?? []).forEach((kw: string) => {
      if (lower.includes(kw.toLowerCase())) score += 2;
    });
    faq.question.toLowerCase().split(' ').forEach((word: string) => {
      if (lower.includes(word) && word.length > 3) score += 1;
    });
    return { ...faq, score };
  });

  const best = scored.sort((a, b) => b.score - a.score)[0];

  if (best.score === 0) {
    return { answer: "I'm sorry, I couldn't find a relevant answer. Please contact us directly or call our clinic." };
  }

  return { answer: best.answer };
}

export async function getAllFAQs() {
  const { data, error } = await supabase.from('faqs').select('*').order('created_at', { ascending: false });
  if (error) throw createError('Failed to fetch FAQs', 500);
  return data;
}

export async function createFAQ(input: { question: string; answer: string; keywords?: string[] }) {
  const { data, error } = await supabase.from('faqs').insert(input).select().single();
  if (error || !data) throw createError('Failed to create FAQ', 500);
  return data;
}

export async function updateFAQ(id: string, input: Partial<{ question: string; answer: string; keywords: string[]; is_active: boolean }>) {
  const { data, error } = await supabase.from('faqs').update(input).eq('id', id).select().single();
  if (error || !data) throw createError('Failed to update FAQ', 500);
  return data;
}

export async function deleteFAQ(id: string) {
  const { error } = await supabase.from('faqs').delete().eq('id', id);
  if (error) throw createError('Failed to delete FAQ', 500);
  return { message: 'FAQ deleted.' };
}
