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
      			xmlns:syn="http://purl.org/rss/1.0/modules/syndication/">  
    
    <!-- Critical Commons XSL version 2.0 by Craig Dietrich -->                        
  
  	<!-- Variales -->
  
   	<xsl:variable name="archiveName">
		<xsl:text>Critical Commons</xsl:text>
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
		<!-- yt:videoid is parsing correctly, so grab it by other means -->
		<rdf:Description rdf:about="{atom:link[@rel='alternate']/@href}">
			<dcterms:source><xsl:value-of select="$archiveName"/></dcterms:source>
			<xsl:apply-templates />	
		</rdf:Description>
	</xsl:template>		
 
 	<xsl:template match="atom:title">
  		<dcterms:title><xsl:value-of select="."/></dcterms:title>
	</xsl:template>	  	
 	 
 	<xsl:template match="atom:content[@type='text']">
  		<dcterms:description><xsl:value-of select="."/></dcterms:description>
	</xsl:template>	 
	
  	<xsl:template match="atom:published">
  		<dcterms:date><xsl:value-of select="."/></dcterms:date>
	</xsl:template>	 
	
	<!--  the author from Critical Commons is the person who uploaded, not the creator of the source -->
	<!-- 
	<xsl:template match="atom:author">	
		<dcterms:creator><xsl:value-of select="atom:name"/></dcterms:creator>
	</xsl:template>	 
	-->
	
	<xsl:template match="atom:category">	
		<dcterms:subject><xsl:value-of select="@term"/></dcterms:subject>
	</xsl:template>	  	    	  	
  
  	<xsl:template match="media:content">
  		<dcterms:type><xsl:value-of select="@type"/></dcterms:type>
  		<art:filename rdf:resource="{@url}"></art:filename>
	</xsl:template>	   
  
 	<xsl:template match="media:thumbnail">	
		<art:thumbnail rdf:resource="{@url}"></art:thumbnail>
	</xsl:template>	    
   
</xsl:stylesheet>                