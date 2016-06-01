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
	
	<xsl:variable name="imageDomain">
		<xsl:text>http://images.metmuseum.org/CRDImages/</xsl:text>
	</xsl:variable>

  	<!-- Templates -->
  	
	<xsl:template match="/">
		<rdf:RDF>
			<xsl:apply-templates select="//title" />
		</rdf:RDF>		
	</xsl:template>  	

	<xsl:template match="*"></xsl:template>

	<xsl:template match="//title">
  		<xsl:variable name="filename">
  			<xsl:choose>
				<xsl:when test="contains(../largeImage,'placeholders')">
					<xsl:text></xsl:text>
				</xsl:when> 
				<xsl:otherwise>		
					<xsl:value-of select="$imageDomain"/><xsl:value-of select="../largeImage"/>
	    		</xsl:otherwise>
    		</xsl:choose>
  		</xsl:variable>		
  		<xsl:variable name="thumbnail">
  			<xsl:choose>
				<xsl:when test="contains(../image,'NoImageAvailableIcon')">
					<xsl:text></xsl:text>
				</xsl:when> 
				<xsl:otherwise>		
					<xsl:value-of select="../image"/>
	    		</xsl:otherwise>
    		</xsl:choose>
  		</xsl:variable>	  		
	    <rdf:Description rdf:about="{$archiveDomain}{../url}">
	    	<dcterms:title><xsl:value-of select="."/></dcterms:title>
			<dcterms:description><xsl:value-of select="../description"/></dcterms:description>
			<art:sourceLocation rdf:resource="{$archiveDomain}{../url}" />
			<art:thumbnail rdf:resource="{$thumbnail}" />	
			<art:filename rdf:resource="{$filename}" />
			<dcterms:identifier><xsl:value-of select="../accessionNumber"/></dcterms:identifier>
			<dcterms:source><xsl:value-of select="$archiveName"/></dcterms:source>
			<dcterms:date><xsl:value-of select="../date"/></dcterms:date>
			<dcterms:medium><xsl:value-of select="../medium"/></dcterms:medium>
			<dcterms:type>Image</dcterms:type>		    	
	    </rdf:Description>
	</xsl:template>  

</xsl:stylesheet>