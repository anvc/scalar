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
                            
    <!-- YouTube import XSL version 2.0 (YouTube API v3) by Craig Dietrich -->                        
      
   	<xsl:variable name="archiveName">
		<xsl:text>YouTube</xsl:text>
	</xsl:variable>    
	
	<xsl:variable name="playerBase">
		<xsl:text>http://www.youtube.com/v/</xsl:text>
	</xsl:variable>	
  
  	<!-- Templates -->    
                            
	<xsl:template match="/">
		<rdf:RDF>
			<xsl:apply-templates select="//node/node" />
		</rdf:RDF>		
	</xsl:template>  

	<xsl:template match="*"></xsl:template>
	
	<xsl:template match="//node/node">			
		<rdf:Description rdf:about="https://www.youtube.com/watch?v={id/videoId}">
			<dcterms:source><xsl:value-of select="$archiveName" /></dcterms:source>
			<art:filename rdf:resource="{$playerBase}{id/videoId}" />
			<art:thumbnail rdf:resource="{snippet/thumbnails/high/url}" />
			<art:sourceLocation rdf:resource="https://www.youtube.com/watch?v={id/videoId}" />
			<dcterms:title><xsl:value-of select="snippet/title" /></dcterms:title>
			<dcterms:description><xsl:value-of select="snippet/description" /></dcterms:description>
			<dcterms:contributor><xsl:value-of select="snippet/channelTitle" /></dcterms:contributor>
			<dcterms:date><xsl:value-of select="snippet/publishedAt"/></dcterms:date>
			<dcterms:identifier><xsl:value-of select="id/videoId"/></dcterms:identifier>			
		</rdf:Description>		
	</xsl:template>		 
                
</xsl:stylesheet>                