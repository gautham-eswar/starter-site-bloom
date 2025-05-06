
import React, { useState, useEffect, useRef } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { FAQCategory } from '@/pages/FAQ';

interface FAQItemProps {
  question: string;
  answer: React.ReactNode;
  category: FAQCategory;
}

// Define the FAQ data
const faqData: FAQItemProps[] = [
  // General
  {
    question: "What is DraftZero?",
    answer: (
      <div>
        <p className="mb-4">DraftZero is an AI-powered resume optimization platform that helps job seekers create resumes that pass both Applicant Tracking Systems (ATS) and impress human recruiters.</p>
        <p>Our technology analyzes your existing resume and enhances it to match job descriptions, improving your chances of getting interviews.</p>
      </div>
    ),
    category: "general"
  },
  {
    question: "How is DraftZero different from other resume tools?",
    answer: (
      <div>
        <p className="mb-4">Unlike most resume builders that focus on templates or basic keyword matching, DraftZero uses proprietary semantic intelligence to understand the meaning behind your experience and qualifications.</p>
        <p className="mb-4">Our key differentiators include:</p>
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li>Dual optimization for both ATS systems and human readers</li>
          <li>Industry-specific customization based on your field</li>
          <li>Preservation of your authentic voice and experience</li>
          <li>Smart keyword prioritization that focuses on what matters most</li>
        </ul>
      </div>
    ),
    category: "general"
  },
  {
    question: "How long does it take to optimize a resume?",
    answer: (
      <p>Most users can optimize their resume in under 15 minutes. The process involves uploading your existing resume, selecting your target job, and reviewing DraftZero's optimization suggestions. You can make additional edits before downloading your finalized resume.</p>
    ),
    category: "general"
  },
  {
    question: "Can I use DraftZero for different job applications?",
    answer: (
      <p>Absolutely! We recommend creating a separate optimized version of your resume for each position you apply to. Our Premium plan allows unlimited optimizations so you can tailor your resume for every application.</p>
    ),
    category: "general"
  },
  
  // Technology
  {
    question: "How does the Semantic Intelligence Engine work?",
    answer: (
      <p>Our Semantic Intelligence Engine analyzes the context and relationships between words and phrases in your resume and target job descriptions. Rather than simple keyword matching, it understands conceptual relationships (e.g., that "customer acquisition" and "business development" are related concepts), ensuring your resume communicates effectively even when using different terminology than the job description.</p>
    ),
    category: "technology"
  },
  {
    question: "What is Dual Optimization Technology?",
    answer: (
      <p>Dual Optimization Technology simultaneously enhances your resume for both ATS systems and human recruiters. For ATS, we optimize keyword placement, document structure, and formatting compatibility. For human readers, we improve narrative flow, visual hierarchy, and achievement focus. This dual approach significantly increases your chances of getting through both screening phases.</p>
    ),
    category: "technology"
  },
  {
    question: "How accurate is DraftZero's ATS optimization?",
    answer: (
      <div>
        <p className="mb-4">DraftZero's ATS optimization has been tested against leading Applicant Tracking Systems with a 94% success rate in correctly parsing and ranking optimized resumes.</p>
        <p>We continuously update our algorithms based on the latest changes in ATS technology and recruitment practices to ensure your resume remains competitive.</p>
      </div>
    ),
    category: "technology"
  },
  {
    question: "Does DraftZero rewrite my entire resume?",
    answer: (
      <p>No, DraftZero doesn't completely rewrite your resume. Our technology enhances your existing content by improving structure, strengthening descriptions, and optimizing keywords. We preserve your authentic experience and voice while making strategic improvements that increase your resume's effectiveness.</p>
    ),
    category: "technology"
  },
  
  // Pricing
  {
    question: "What pricing plans does DraftZero offer?",
    answer: (
      <div>
        <p className="mb-4">DraftZero offers three main pricing tiers:</p>
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li><strong>Basic (Free):</strong> Optimize one resume with limited features</li>
          <li><strong>Standard ($19.99/month):</strong> Up to 5 resume optimizations per month with all core features</li>
          <li><strong>Premium ($39.99/month):</strong> Unlimited optimizations with all features plus priority support</li>
        </ul>
        <p>We also offer annual pricing with a 20% discount compared to monthly plans.</p>
      </div>
    ),
    category: "pricing"
  },
  {
    question: "Is there a free trial?",
    answer: (
      <p>Yes, we offer a 7-day free trial of our Premium plan, giving you full access to all features. No credit card is required to start your trial. You can downgrade to our free Basic plan at any time if you decide not to continue with Premium.</p>
    ),
    category: "pricing"
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: (
      <p>Absolutely. You can cancel your subscription at any time through your account settings. If you cancel, you'll continue to have access to your plan until the end of your current billing period. We don't offer refunds for partial billing periods, but you won't be charged again after cancellation.</p>
    ),
    category: "pricing"
  },
  {
    question: "Do you offer discounts for students or career services?",
    answer: (
      <p>Yes, we offer special pricing for students, educational institutions, and career service organizations. Please contact our sales team at sales@draftzero.com for more information about our educational and volume discount programs.</p>
    ),
    category: "pricing"
  },
  
  // Account
  {
    question: "How do I create an account?",
    answer: (
      <div>
        <p className="mb-4">Creating a DraftZero account is simple:</p>
        <ol className="list-decimal pl-5 mb-4 space-y-2">
          <li>Click the "Sign Up" or "Get Started" button on our website</li>
          <li>Enter your email address and create a password</li>
          <li>Verify your email address by clicking the link in our verification email</li>
          <li>Complete your profile information</li>
        </ol>
        <p>You can also sign up using your Google or LinkedIn account for faster registration.</p>
      </div>
    ),
    category: "account"
  },
  {
    question: "How can I reset my password?",
    answer: (
      <div>
        <p className="mb-4">To reset your password:</p>
        <ol className="list-decimal pl-5 mb-4 space-y-2">
          <li>Click the "Login" button on our website</li>
          <li>Click "Forgot password?" below the login form</li>
          <li>Enter the email address associated with your account</li>
          <li>Check your email for a password reset link</li>
          <li>Click the link and create a new password</li>
        </ol>
        <p>For security reasons, password reset links expire after 24 hours.</p>
      </div>
    ),
    category: "account"
  },
  {
    question: "How do I access my optimized resumes?",
    answer: (
      <p>All your optimized resumes are stored in your DraftZero account dashboard. Simply log in to your account, navigate to "My Resumes," and you'll see all your optimized documents. From there, you can download, edit, or create new versions for different job applications.</p>
    ),
    category: "account"
  },
  {
    question: "Is my resume data secure?",
    answer: (
      <div>
        <p className="mb-4">Yes, we take data security very seriously. DraftZero employs industry-standard encryption and security practices to protect your personal information and resume data.</p>
        <p className="mb-4">Key security features include:</p>
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li>End-to-end encryption of all resume data</li>
          <li>Secure server infrastructure with regular security audits</li>
          <li>Strict internal access controls</li>
          <li>Compliance with data protection regulations</li>
        </ul>
        <p>You can review our Privacy Policy for detailed information about how we handle your data.</p>
      </div>
    ),
    category: "account"
  }
];

interface FAQAccordionProps {
  activeCategory: FAQCategory;
  searchQuery: string;
}

const FAQAccordion: React.FC<FAQAccordionProps> = ({ activeCategory, searchQuery }) => {
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'positive' | 'negative' | null>>({});
  const accordionRef = useRef<HTMLDivElement>(null);

  // Filter FAQs based on active category and search query
  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = activeCategory === faq.category;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (typeof faq.answer === 'string' ? 
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) : 
        true); // Simple search - in a real app you'd want to search the HTML content too
    
    return matchesCategory && matchesSearch;
  });

  // Handle feedback for an answer
  const handleFeedback = (questionId: string, type: 'positive' | 'negative') => {
    setFeedbackGiven(prev => ({
      ...prev,
      [questionId]: type
    }));
    
    // In a real app, you would send this feedback to your backend
    console.log(`User gave ${type} feedback for question: ${questionId}`);
    
    // Show a thank you message (handled by CSS)
  };

  // Animation for accordion items on mount and category change
  useEffect(() => {
    if (accordionRef.current) {
      const items = accordionRef.current.querySelectorAll('.faq-item');
      
      items.forEach((item, index) => {
        setTimeout(() => {
          item.classList.add('opacity-100', 'translate-y-0');
          item.classList.remove('opacity-0', 'translate-y-4');
        }, index * 100);
      });
    }
    
    // Reset expanded question when category changes
    setExpandedQuestion(null);
  }, [activeCategory, searchQuery]);

  // Handle accordion value change
  const handleValueChange = (value: string) => {
    setExpandedQuestion(value === expandedQuestion ? null : value);
    
    // Smooth scroll to position the question in view
    if (value !== expandedQuestion) {
      setTimeout(() => {
        const questionElement = document.getElementById(`faq-${value}`);
        if (questionElement) {
          questionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  };

  return (
    <div ref={accordionRef} className="max-w-3xl mx-auto mb-12">
      {filteredFAQs.length > 0 ? (
        <Accordion 
          type="single" 
          collapsible 
          value={expandedQuestion || ''}
          onValueChange={handleValueChange}
          className="space-y-4"
        >
          {filteredFAQs.map((faq, index) => {
            const questionId = `q${index}`;
            return (
              <AccordionItem 
                key={questionId} 
                value={questionId}
                id={`faq-${questionId}`}
                className="faq-item opacity-0 translate-y-4 transition-all duration-500 border border-gray-200 dark:border-draft-green/30 rounded-lg overflow-hidden data-[state=open]:bg-[#F7F4ED] dark:data-[state=open]:bg-draft-green/20"
              >
                <AccordionTrigger className="px-6 py-4 text-draft-green dark:text-draft-yellow text-left text-lg font-medium hover:bg-[#F7F4ED] dark:hover:bg-draft-green/10">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 text-draft-text dark:text-gray-300 text-[1.1rem]">
                  <div className="mb-6">
                    {faq.answer}
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-draft-green/20">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Was this helpful?
                      </div>
                      
                      {feedbackGiven[questionId] ? (
                        <div className="text-sm text-draft-green dark:text-draft-yellow animate-fade-in">
                          Thank you for your feedback!
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleFeedback(questionId, 'positive')}
                            className="p-2 rounded-full hover:bg-draft-green/10 dark:hover:bg-draft-green/20 transition-colors"
                            aria-label="Yes, this was helpful"
                          >
                            <ThumbsUp className="h-5 w-5 text-draft-green dark:text-draft-yellow" />
                          </button>
                          <button 
                            onClick={() => handleFeedback(questionId, 'negative')}
                            className="p-2 rounded-full hover:bg-draft-green/10 dark:hover:bg-draft-green/20 transition-colors"
                            aria-label="No, this wasn't helpful"
                          >
                            <ThumbsDown className="h-5 w-5 text-draft-green dark:text-draft-yellow" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-draft-green/10 rounded-lg border border-gray-200 dark:border-draft-green/30">
          <div className="mb-4">
            <Search className="h-12 w-12 mx-auto text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-draft-green dark:text-draft-yellow mb-2">No results found</h3>
          <p className="text-draft-text dark:text-gray-300">
            We couldn't find any FAQs matching your search.
          </p>
          <button 
            onClick={() => setFilter('')}
            className="mt-4 px-4 py-2 bg-draft-green dark:bg-draft-yellow text-white dark:text-draft-green rounded-md hover:bg-draft-green/90 dark:hover:bg-draft-yellow/90 transition-colors"
          >
            Clear search
          </button>
        </div>
      )}
      
      {/* Animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default FAQAccordion;
