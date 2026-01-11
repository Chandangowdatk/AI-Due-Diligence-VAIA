"""Think tool for agent reflection and planning."""

import logging
from langchain_core.tools import tool

logger = logging.getLogger(__name__)


@tool
def think(thought: str) -> str:
    """Reflect on gathered information and plan next steps.
    
    Use this tool to pause and think strategically about your research.
    This creates a deliberate reflection point in your workflow.
    
    When to use:
    - After receiving search results: Analyze what you found
    - Before deciding next steps: Assess if you have enough information
    - When identifying gaps: Determine what's missing
    - Before concluding: Verify you can provide a comprehensive answer
    
    Your reflection should address:
    1. **Analysis**: What concrete information have I gathered?
    2. **Gaps**: What crucial information is still missing?
    3. **Quality**: Do I have sufficient evidence for this section?
    4. **Next Steps**: Should I search more or move to the next section?
    
    Args:
        thought: Your detailed reflection on research progress.
                 Include:
                 - Key findings from recent searches
                 - Information gaps identified
                 - Assessment of data quality
                 - Decision on next action
                 
    Returns:
        Confirmation that your reflection was recorded.
        The thought is echoed back for conversation history.
    
    Example:
        think('''
        Analysis: Found Stripe's 2023 revenue (~$14B) and key executives.
        Gaps: Missing specific board composition and ESOP details.
        Quality: Good coverage of leadership, need more on governance.
        Next Steps: Search for "Stripe board of directors governance" 
        to fill the governance gap before moving to financials.
        ''')
    """
    logger.info(f"Think tool invoked: {thought[:100]}...")
    
    # Echo the thought back - this helps maintain conversation context
    # and allows the agent to reference its own reasoning
    return f"Reflection recorded:\n\n{thought}"


@tool
def assess_section_completeness(
    section_name: str,
    data_found: str,
    data_gaps: str,
) -> str:
    """Assess whether a section has sufficient data to proceed.
    
    Use this after gathering data for a section to decide if you should:
    - Continue searching for more information
    - Mark the section as complete
    - Mark the section as incomplete (if max iterations reached)
    
    Args:
        section_name: Name of the DD section being researched
        data_found: Summary of information successfully gathered
        data_gaps: List of information that couldn't be found
        
    Returns:
        Assessment with recommendation on next steps.
    """
    assessment = f"""
Section Assessment: {section_name}

DATA FOUND:
{data_found}

DATA GAPS:
{data_gaps}

RECOMMENDATION:
Based on the data gathered, assess whether:
1. The section has sufficient information for a professional DD report
2. Additional searches would likely yield meaningful new data
3. The gaps are critical or acceptable for this section

If critical gaps remain and you haven't reached max iterations, 
continue searching. Otherwise, proceed to the next section.
"""
    
    logger.info(f"Section assessment for {section_name}")
    return assessment
