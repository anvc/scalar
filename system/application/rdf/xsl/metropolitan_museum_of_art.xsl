<?xml version="1.0" encoding="UTF-8"?>   
<xsl:stylesheet version="1.0"
				xmlns:x="http://www.w3.org/1999/xhtml"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" 
                xmlns:scalar="http://vectorsdev.usc.edu/scalar/elements/1.0/"
                xmlns:dc="http://purl.org/dc/elements/1.1/"
                xmlns:dcterms="http://purl.org/dc/terms/"
                xmlns:art="http://simile.mit.edu/2003/10/ontologies/artstor#"
                xmlns:sioc="http://rdfs.org/sioc/ns#">  

  	<!-- Variales -->
  
   	<xsl:variable name="archiveName">
		<xsl:text>The Metropolitan Museum of Art</xsl:text>
	</xsl:variable>    

   	<xsl:variable name="archiveDomain">
		<xsl:text>http://www.metmuseum.org</xsl:text>
	</xsl:variable>   

  	<!-- Templates -->
  	
	<xsl:template match="/">
		<rdf:RDF>
			<xsl:apply-templates select="//div[@class='list-results-container']" />
		</rdf:RDF>		
	</xsl:template>  	

	<xsl:template match="*"></xsl:template>

	<xsl:template match="//div[@class='list-results-container']">
		<xsl:apply-templates select="div" />
	</xsl:template>  

	<xsl:template match="div">
	
  		<xsl:variable name="identifier">
    		<xsl:call-template name="string-replace-all">
      			<xsl:with-param name="text" select="div[@class='list-view-object-info']/div[@class='objectinfo'][3]" />
      			<xsl:with-param name="replace" select="'Accession Number: '" />
     	 		<xsl:with-param name="by" select="''" />
    		</xsl:call-template>
  		</xsl:variable>	
  		<xsl:variable name="filename">
  			<xsl:choose>
				<xsl:when test="contains(div[@class='list-view-thumbnail']/a/img/@src,'NoImageAvailable')">
					<xsl:text></xsl:text>
				</xsl:when> 
				<xsl:otherwise>		
		    		<xsl:call-template name="string-replace-all">
		      			<xsl:with-param name="text" select="div[@class='list-view-thumbnail']/a/img/@src" />
		      			<xsl:with-param name="replace" select="'thumb'" />
		     	 		<xsl:with-param name="by" select="'large'" />
		    		</xsl:call-template>
	    		</xsl:otherwise>
    		</xsl:choose>
  		</xsl:variable>	
     	<xsl:variable name="date">
    		<xsl:call-template name="string-replace-all">
      			<xsl:with-param name="text" select="div[@class='list-view-object-info']/div[@class='objectinfo'][1]" />
      			<xsl:with-param name="replace" select="'Date: '" />
     	 		<xsl:with-param name="by" select="''" />
    		</xsl:call-template>
  		</xsl:variable>	 		
   		<xsl:variable name="medium">
    		<xsl:call-template name="string-replace-all">
      			<xsl:with-param name="text" select="div[@class='list-view-object-info']/div[@class='objectinfo'][2]" />
      			<xsl:with-param name="replace" select="'Medium: '" />
     	 		<xsl:with-param name="by" select="''" />
    		</xsl:call-template>
  		</xsl:variable>	 			
	
		<rdf:Description rdf:about="{$archiveDomain}{div[2]/a/@href}">
			<dcterms:identifier><xsl:value-of select="$identifier"/></dcterms:identifier>
			<art:thumbnail rdf:resource="{div[@class='list-view-thumbnail']/a/img/@src}" />
			<art:filename rdf:resource="{$filename}" />	
			<art:sourceLocation rdf:resource="{$archiveDomain}{div[2]/a/@href}" />	
			<dcterms:source><xsl:value-of select="$archiveName"/></dcterms:source>
			<dcterms:title><xsl:value-of select="div[@class='list-view-object-info']/a/div[@class='objtitle']"/></dcterms:title>
			<dcterms:description><xsl:value-of select="div[@class='list-view-object-info']/div[@class='artist'][2]"/></dcterms:description>
			<dcterms:date><xsl:value-of select="$date"/></dcterms:date>
			<dcterms:medium><xsl:value-of select="$medium"/></dcterms:medium>
			<dcterms:type>Image</dcterms:type>				
		</rdf:Description>
			
	</xsl:template>  

 	<xsl:template name="string-replace-all">
    	<xsl:param name="text" />
		<xsl:param name="replace" />
    	<xsl:param name="by" />
    	<xsl:choose>
      		<xsl:when test="contains($text, $replace)">
        		<xsl:value-of select="substring-before($text,$replace)" />
        		<xsl:value-of select="$by" />
        		<xsl:call-template name="string-replace-all">
          			<xsl:with-param name="text" select="substring-after($text,$replace)" />
          			<xsl:with-param name="replace" select="$replace" />
          			<xsl:with-param name="by" select="$by" />
        		</xsl:call-template>
      		</xsl:when>
      		<xsl:otherwise>
        		<xsl:value-of select="$text" />
      		</xsl:otherwise>
    	</xsl:choose>
  </xsl:template>

</xsl:stylesheet>