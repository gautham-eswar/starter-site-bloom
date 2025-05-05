
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import Header from '@/components/Header';

const ComparisonPage: React.FC = () => {
  const improvementData = [
    {
      section: 'Summary',
      original: 'Web developer with experience in JavaScript',
      improved: 'Experienced software engineer specializing in JavaScript frameworks with a track record of delivering scalable web applications',
      type: 'Major'
    },
    {
      section: 'Experience',
      original: 'Worked in the frontend team',
      improved: 'Led the frontend team and increased user engagement.',
      type: 'Major'
    },
    {
      section: 'Skills',
      original: 'React',
      improved: 'React (Redux, Hooks, Context API)',
      type: 'Minor'
    }
  ];

  return (
    <div className="min-h-screen bg-draft-bg">
      <Header />
      
      <main className="px-8 py-12 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Left side - Improvements */}
          <div className="space-y-8">
            <h2 className="text-2xl font-serif text-draft-green">Improvements</h2>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="border border-draft-green bg-white rounded-lg p-4 flex flex-col items-center justify-center">
                <p className="text-draft-green mb-2">Old Score</p>
                <p className="text-4xl font-bold text-draft-green">67/100</p>
              </div>
              
              <div className="border border-draft-green bg-white rounded-lg p-4 flex flex-col items-center justify-center">
                <p className="text-draft-green mb-2">Improved Score</p>
                <p className="text-4xl font-bold text-draft-green">98/100</p>
              </div>
              
              <div className="border border-draft-green bg-white rounded-lg p-4 flex flex-col items-center justify-center">
                <p className="text-draft-green mb-2">Another metric</p>
                <p className="text-4xl font-bold text-draft-green">97%</p>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden">
              <Table>
                <TableHeader className="bg-[#f1f1eb]">
                  <TableRow>
                    <TableHead className="text-draft-green">Section</TableHead>
                    <TableHead className="text-draft-green">Original</TableHead>
                    <TableHead className="text-draft-green w-[40%]">Improved</TableHead>
                    <TableHead className="text-draft-green">Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {improvementData.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{row.section}</TableCell>
                      <TableCell>{row.original}</TableCell>
                      <TableCell className="text-draft-green">{row.improved}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          row.type === 'Major' ? 'bg-draft-coral bg-opacity-20 text-draft-coral' : 'bg-draft-mint bg-opacity-20 text-draft-green'
                        }`}>
                          {row.type}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          
          {/* Right side - Resume Preview */}
          <div className="space-y-4 bg-[#F7F4ED] p-6 rounded-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-serif text-draft-green">Resume Preview</h2>
              <Button className="bg-draft-green hover:bg-draft-green/90 text-white">
                <Download className="mr-2 h-4 w-4" /> Download
              </Button>
            </div>
            
            <div className="bg-white rounded-lg p-6 h-[600px] overflow-auto">
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-draft-green">Lucy Cheng</h1>
                  <p>CPA</p>
                </div>
                
                <div className="flex justify-between text-sm">
                  <div>
                    <p>Phone: 942-957-0000</p>
                    <p>Email: lucy@gmail.com</p>
                  </div>
                  <div>
                    <p>LinkedIn: linkedin.com/in/lucycheng</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm">Results-focused senior CPA and CMA with 10 years of experience at Mastercard and Oracle. Seeking to leverage proven skills in account reconciliation and cloud-based accounting for Goldman Sachs. Enhanced Oracle's cloud computing process to save 900 department hours per year. Identified and rectified a recurring issue that saved $1.3 million annually.</p>
                </div>
                
                <div>
                  <h2 className="text-lg font-medium text-draft-green border-b border-draft-green pb-1">Experience</h2>
                  
                  <div className="mt-3">
                    <div className="flex justify-between">
                      <p className="font-medium">Senior CPA</p>
                      <p>2017-07 - present</p>
                    </div>
                    <p>Oracle, Chicago</p>
                    <ul className="list-disc ml-5 mt-1 text-sm">
                      <li>Supervised general accounting functions for monthly close process</li>
                      <li>Improved use of cloud computing best practices to enhance data security and save 900 hours per year, saving the department $800,000 annually.</li>
                      <li>Identified and resolved a company-wide process issue that saved $2 million per year.</li>
                    </ul>
                  </div>
                  
                  <div className="mt-5">
                    <div className="flex justify-between">
                      <p className="font-medium">CPA, Capital Accounting</p>
                      <p>2010-06 - 2015-06</p>
                    </div>
                    <p>Mastercard, Chicago</p>
                    <ul className="list-disc ml-5 mt-1 text-sm">
                      <li>Key member of accounting month-end close process.</li>
                      <li>Through account analysis, identified opportunity to reduce certain variable costs by 15%, saving the company a total of $1.2 million annually.</li>
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-medium text-draft-green border-b border-draft-green pb-1">Education</h2>
                  
                  <div className="mt-3">
                    <div className="flex justify-between">
                      <p className="font-medium">MBA, Illinois State University</p>
                      <p>2006-09 - 2010-06</p>
                    </div>
                    <ul className="list-disc ml-5 mt-1 text-sm">
                      <li>Concentration in accounting</li>
                      <li>Dean's List</li>
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-medium text-draft-green border-b border-draft-green pb-1">Skills</h2>
                  
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-sm">Financial payments</p>
                      <div className="flex mt-1">
                        {Array(5).fill(0).map((_, i) => (
                          <div key={i} className="w-5 h-2 bg-draft-green mr-1"></div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm">Payroll</p>
                      <div className="flex mt-1">
                        {Array(5).fill(0).map((_, i) => (
                          <div key={i} className="w-5 h-2 bg-draft-green mr-1"></div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm">IT skills</p>
                      <div className="flex mt-1">
                        {Array(5).fill(0).map((_, i) => (
                          <div key={i} className="w-5 h-2 bg-draft-green mr-1"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ComparisonPage;
