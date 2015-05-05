<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
				xmlns:base="http://example.com/"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" 
                xmlns:scalar="http://vectorsdev.usc.edu/scalar/elements/1.0/"
                xmlns:dc="http://purl.org/dc/elements/1.1/"
                xmlns:dcterms="http://purl.org/dc/terms/"
                xmlns:art="http://simile.mit.edu/2003/10/ontologies/artstor#"
                xmlns:sioc="http://rdfs.org/sioc/ns#">  
                            
    <!-- Prezi import XSL version 1.0 by Craig Dietrich -->                        
      
   	<xsl:variable name="archiveName">
		<xsl:text>SoundCloud</xsl:text>
	</xsl:variable>    
  
  	<!-- Templates -->    
                            
	<xsl:template match="/">
		<rdf:RDF>
			<xsl:apply-templates select="//node" />
		</rdf:RDF>		
	</xsl:template>  

	<xsl:template match="*"></xsl:template>
	
	<xsl:template match="//node">			
		<xsl:variable name="thumbnail">
	  		<xsl:choose>	
				<xsl:when test="artwork_url != ''">
					<xsl:value-of select="artwork_url" />
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="user/avatar_url" />
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>	 		
		<rdf:Description rdf:about="{permalink_url}">
			<dcterms:source><xsl:value-of select="$archiveName" /></dcterms:source>
			<art:filename rdf:resource="{permalink_url}" />
			<art:thumbnail rdf:resource="{$thumbnail}" />
			<art:sourceLocation rdf:resource="{permalink_url}" />
			<dcterms:title><xsl:value-of select="title" /></dcterms:title>
			<dcterms:description><xsl:value-of select="description" /></dcterms:description>
			<dcterms:contributor><xsl:value-of select="user/username" /></dcterms:contributor>
			<dcterms:date><xsl:value-of select="normalize-space(last_modified)"/></dcterms:date>
			<dcterms:identifier><xsl:value-of select="id" /></dcterms:identifier>		
			<dcterms:rights><xsl:value-of select="license" /></dcterms:rights>	
		</rdf:Description>		
	</xsl:template>		 
                
</xsl:stylesheet>                