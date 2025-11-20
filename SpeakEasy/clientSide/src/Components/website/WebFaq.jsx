import React, { useEffect, useState } from 'react'
import Nav from './Nav'
import Footer from './Footer'
import axios from 'axios';

const WebFaq = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const [faqData,setFaqs] = useState([]);
  const fetchFaqs = async () => {
  try {
    const response = await axios.get("http://localhost:5000/faq_fetch");
    setFaqs(response.data);
  } catch (error) {
    console.error(error);
  }
};

useEffect(()=>{
  fetchFaqs()
})
  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <>
      <Nav/>
      
      <section id="bannarSec">
        <div id="overlay">
          <div className="container">
            <h3>Frequently Asked Questions</h3>
          </div>
        </div>
      </section>

     <section className='FaqCon' style={{ 
    padding: '50px 0', 
    backgroundColor: '#f5f5f5', 
    minHeight: '60vh',
    width: '100%' // Ensure it spans full width
}}>
    {/* Equivalent of Bootstrap's .container */}
    <div style={{
        maxWidth: '1140px', // A common max-width for containers
        margin: '0 auto', // Center the container
        padding: '0 15px' // Horizontal padding for smaller screens
    }}>
        {/* Equivalent of Bootstrap's .row and .justify-content-center */}
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center'
        }}>
            {/* Equivalent of Bootstrap's .col-md-8 */}
            <div style={{
                width: '100%',
                maxWidth: '66.666667%', // Roughly equivalent to col-md-8 (8/12 * 100%)
                padding: '0 15px'
            }}>
                <h2 style={{ 
                    color: '#333', 
                    textAlign: 'center', 
                    marginBottom: '3rem' // Equivalent to mb-5
                }}>
                    Common Questions
                </h2>
                <div className="blankDiv"></div>
                {faqData.map((faq, index) => (
                    <div 
                        key={index} 
                        // Equivalent of Bootstrap's .card and .mb-3
                        style={{ 
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            marginBottom: '1rem' // Equivalent to mb-3
                        }}
                    >
                        {/* Equivalent of Bootstrap's .card-header */}
                        <div 
                            style={{ 
                                backgroundColor: activeIndex === index ? '#ff9444' : 'white',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '15px 20px',
                                transition: 'background-color 0.3s' // Nice transition effect
                            }}
                            onClick={() => toggleAccordion(index)}
                        >
                            {/* Equivalent of Bootstrap's .mb-0 */}
                            <h6 style={{ 
                                color: activeIndex === index ? 'white' : '#333',
                                display: 'flex',
                                fontSize:20,
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                margin: '0' // Remove default margin from h6
                            }}>
                                {faq.faqQuestion}
                                <span style={{ fontSize: '18px' }}>
                                    {activeIndex === index ? '−' : '+'}
                                </span>
                            </h6>
                        </div>
                        
                        {/* Conditional rendering for the answer */}
                        {activeIndex === index && (
                            // Equivalent of Bootstrap's .card-body
                            <div style={{ padding: '20px' }}>
                                {/* Equivalent of Bootstrap's .mb-0 */}
                                <p style={{ 
                                    color: '#666', 
                                    lineHeight: '1.6',
                                    margin: '0' // Remove default margin from p
                                }}>
                                    {faq.faqAnswer}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    </div>
</section>
      
      <Footer/>
    </>
  )
}

export default WebFaq