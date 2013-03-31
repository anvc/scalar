<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" 
                xmlns:scalar="http://vectorsdev.usc.edu/scalar/elements/1.0/"
                xmlns:dc="http://purl.org/dc/elements/1.1/"
                xmlns:dcterms="http://purl.org/dc/terms/"
                xmlns:art="http://simile.mit.edu/2003/10/ontologies/artstor#"
                xmlns:sioc="http://rdfs.org/sioc/ns#"
				xmlns:atom="http://www.w3.org/2005/Atom" 
				xmlns:media="http://search.yahoo.com/mrss/" 
				xmlns:openSearch="http://a9.com/-/spec/opensearchrss/1.0/" 
				xmlns:gd="http://schemas.google.com/g/2005" 
				xmlns:gml="http://www.opengis.net/gml" 
				xmlns:yt="http://gdata.youtube.com/schemas/2007" 
				xmlns:georss="http://www.georss.org/georss">  
    
    <!-- YouTube search API import XSL version 1.0 by Craig Dietrich -->                        
  
  	<!-- Variales -->
  
   	<xsl:variable name="archiveName">
		<xsl:text>YouTube</xsl:text>
	</xsl:variable>    
  
 	<xsl:variable name="feedBase">
		<xsl:text>http://gdata.youtube.com/feeds/api/videos/</xsl:text>
	</xsl:variable>    
	
	<xsl:variable name="playerBase">
		<xsl:text>http://www.youtube.com/v/</xsl:text>
	</xsl:variable>
  
  	<!-- Templates -->    
                            
	<xsl:template match="/">
		<rdf:RDF>
			<xsl:apply-templates select="atom:feed" />
		</rdf:RDF>		
	</xsl:template>  

	<xsl:template match="*"></xsl:template>

	<xsl:template match="atom:feed">	
		<xsl:apply-templates select="atom:entry" />
	</xsl:template>
	
	<xsl:template match="atom:entry">	
		<!-- yt:videoid doesn't seem to be coming through, so get it by other means -->
		<xsl:variable name="resourceSlug" select="substring-after(atom:id, $feedBase)" />
		<rdf:Description rdf:about="{atom:link[@rel='alternate']/@href}">
			<dcterms:source><xsl:value-of select="$archiveName"/></dcterms:source>
			<dcterms:type>video</dcterms:type>
			<dcterms:identifier><xsl:value-of select="$resourceSlug"/></dcterms:identifier>
			<art:filename rdf:resource="{$playerBase}{$resourceSlug}"></art:filename>
			<xsl:apply-templates />	
		</rdf:Description>
	</xsl:template>		
 
 	<xsl:template match="atom:title">
  		<dcterms:title><xsl:value-of select="."/></dcterms:title>
	</xsl:template>	  	
  
  	<xsl:template match="atom:published">
  		<dcterms:date><xsl:value-of select="."/></dcterms:date>
	</xsl:template>	 
	
	<xsl:template match="atom:author">	
		<dcterms:contributor><xsl:value-of select="atom:name"/></dcterms:contributor>
	</xsl:template>	 
	
	<xsl:template match="atom:category">	
		<dcterms:subject><xsl:value-of select="@term"/></dcterms:subject>
	</xsl:template>	  	 
  
	<xsl:template match="media:group">	
		<xsl:apply-templates select="media:thumbnail" />
		<dcterms:description><xsl:value-of select="media:description"/></dcterms:description>
	</xsl:template>	   	  	
  
 	<xsl:template match="media:thumbnail">	
		<art:thumbnail rdf:resource="{@url}"></art:thumbnail>
	</xsl:template>	    
   
</xsl:stylesheet>                