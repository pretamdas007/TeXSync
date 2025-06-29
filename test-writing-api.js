// Test script for writing analysis API
// Run this with: node test-writing-api.js

const testText = "This approach was first proposed by Smith et al. in their seminal paper. The equation represents a fundamental relationship in quantum mechanics. Furthermore, the results show a significant improvement over existing methods.";

async function testWritingAnalysis() {
  try {
    console.log('Testing Writing Analysis API...');
    console.log('Text to analyze:', testText);
    console.log('\n--- Making API Request ---');
    
    const response = await fetch('http://localhost:3000/api/writing-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: testText,
        type: 'comprehensive',
        context: 'Academic research paper test'
      }),
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }

    const result = await response.json();
    console.log('\n--- API Response ---');
    console.log('Success:', result.success);
    console.log('Plagiarism Score:', result.plagiarismScore);
    console.log('Grammar Score:', result.grammarScore);
    console.log('Word Count:', result.wordCount);
    console.log('Grammar Issues:', result.grammarIssues?.length || 0);
    console.log('Plagiarism Matches:', result.plagiarismMatches?.length || 0);
    console.log('Citation Issues:', result.citationIssues?.length || 0);
    
    if (result.grammarIssues?.length > 0) {
      console.log('\n--- Sample Grammar Issue ---');
      console.log(result.grammarIssues[0]);
    }
    
    if (result.plagiarismMatches?.length > 0) {
      console.log('\n--- Sample Plagiarism Match ---');
      console.log(result.plagiarismMatches[0]);
    }
    
    if (result.citationIssues?.length > 0) {
      console.log('\n--- Sample Citation Issue ---');
      console.log(result.citationIssues[0]);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Only run if this is the main module
if (require.main === module) {
  testWritingAnalysis();
}

module.exports = { testWritingAnalysis };
