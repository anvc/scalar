<?xml version="1.0" encoding="UTF-8"?>   
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" 
                xmlns:scalar="http://vectorsdev.usc.edu/scalar/elements/1.0/"
                xmlns:dc="http://purl.org/dc/elements/1.1/"
                xmlns:dcterms="http://purl.org/dc/terms/"
                xmlns:art="http://simile.mit.edu/2003/10/ontologies/artstor#"
                xmlns:sioc="http://rdfs.org/sioc/ns#">  

  	<!-- Variales -->
  
   	<xsl:variable name="archiveName">
		<xsl:text>Hemispheric Institute</xsl:text>
	</xsl:variable>    
  
 	<xsl:variable name="rights">
		<xsl:text>"Materials of the Hemispheric Institute Digital Video Library are protected by copyright. They may not be copied, downloaded, or reproduced. The owner of this work has granted NYU Libraries non-exclusive rights to include this material in the Hemispheric Institute Digital Video Library and to make it accessible to the public for educational and research purposes. Requests to purchase or for permission to use the work should be directed to the owner."</xsl:text>
	</xsl:variable>   

  	<!-- Templates -->
  	
	<xsl:template match="/">
		<rdf:RDF>
			<xsl:apply-templates select="//div[@class='addHRule']" />
		</rdf:RDF>		
	</xsl:template>  	

	<xsl:template match="*"></xsl:template>

	<xsl:template match="//div[@class='addHRule']">
		<xsl:if test="following-sibling::div[@id='title']">
			<xsl:variable name="resourceURI" select="following-sibling::div[@id='title']/span/a/@href" />
			<xsl:variable name="resourceSlug" select="translate(substring($resourceURI, 28),'.html','')" />
			<rdf:Description rdf:about="{$resourceURI}">
				<dcterms:identifier>Hemi-<xsl:value-of select="$resourceSlug"/></dcterms:identifier>
				<art:filename rdf:resource="{$resourceURI}" />
				<dcterms:source><xsl:value-of select="$archiveName"/></dcterms:source>
				<dcterms:title><xsl:value-of select="normalize-space(following-sibling::div[@id='title'])"/></dcterms:title>
				<dcterms:description><xsl:value-of select="normalize-space(following-sibling::div[@id='abstract'])"/></dcterms:description>
				<dcterms:rights><xsl:value-of select="$rights"/></dcterms:rights>
				<dcterms:type>Video</dcterms:type>
				<dcterms:spatial><xsl:value-of select="normalize-space(following-sibling::div[@id='dateLoc'])"/></dcterms:spatial>
				<xsl:variable name="subjects" select="normalize-space(following-sibling::div[@id='subject'])" /> 
			 	<xsl:call-template name="parse-subjects">
	      			<xsl:with-param name="subjects" select="$subjects" />
	    		</xsl:call-template>			
			</rdf:Description>	
		</xsl:if>
	</xsl:template>  

	<xsl:template name="parse-subjects">	
		<xsl:param name="subjects" /> 
		<!-- add a trailing comma to list -->
		<xsl:variable name="tag_list" select="concat($subjects,',')" /> 
    	<!-- write a node for each element in the list -->
		 <xsl:call-template name="output-tokens">
      		<xsl:with-param name="list" select="$tag_list" />
      		<xsl:with-param name="delineator" select="','" />
    	</xsl:call-template>
	</xsl:template>  	      
       
    <!-- http://stackoverflow.com/questions/136500/does-xslt-have-a-split-function -->   
	<xsl:template name="output-tokens">
    	<xsl:param name="list" /> 
    	<xsl:param name="delineator" />
    	<xsl:variable name="newlist" select="normalize-space($list)" /> 
    	<xsl:variable name="first" select="substring-before($newlist, $delineator)" /> 
    	<xsl:variable name="remaining" select="substring-after($newlist, $delineator)" /> 
    	<dcterms:subject>
        	<xsl:value-of select="$first" /> 
    	</dcterms:subject>
    	<xsl:if test="$remaining">
        	<xsl:call-template name="output-tokens">
                <xsl:with-param name="list" select="$remaining" /> 
                <xsl:with-param name="delineator" select="','" />
        	</xsl:call-template>
    	</xsl:if>
	</xsl:template>  

</xsl:stylesheet>