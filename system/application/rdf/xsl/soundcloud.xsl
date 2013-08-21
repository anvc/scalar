<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" 
                xmlns:scalar="http://vectorsdev.usc.edu/scalar/elements/1.0/"
                xmlns:dc="http://purl.org/dc/elements/1.1/"
                xmlns:dcterms="http://purl.org/dc/terms/"
                xmlns:art="http://simile.mit.edu/2003/10/ontologies/artstor#"
                xmlns:sioc="http://rdfs.org/sioc/ns#">  
                            
    <!-- Soundcloud import XSL version 1.0 by Craig Dietrich -->                        
  
  	<!-- Variales -->
  
   	<xsl:variable name="archiveName">
		<xsl:text>SoundCloud</xsl:text>
	</xsl:variable>    
                
  	<!-- Templates -->
  
	<xsl:template match="/">
		<rdf:RDF>
			<xsl:apply-templates select="/tracks/track" />			
		</rdf:RDF>		
	</xsl:template>  
	
	<xsl:template match="/tracks/track">	
		<rdf:Description rdf:about="{permalink-url}">
			<dcterms:source><xsl:value-of select="$archiveName"/></dcterms:source>
			<art:sourceLocation rdf:resource="{permalink-url}" />
			<art:filename rdf:resource="{permalink-url}" />
			<dcterms:identifier><xsl:value-of select="id"/></dcterms:identifier>
			<xsl:apply-templates>
				<xsl:with-param name="resourceSlug" select="id" />
			</xsl:apply-templates>			
		</rdf:Description>
	</xsl:template>                
                
	<xsl:template match="*"></xsl:template>                
                
 	<xsl:template match="title">
  		<dcterms:title><xsl:value-of select="."/></dcterms:title>
	</xsl:template>	                
   
 	<xsl:template match="description">
  		<dcterms:description><xsl:value-of select="."/></dcterms:description>
	</xsl:template>	    
	
	<xsl:template match="genre">
		<dcterms:subject><xsl:value-of select="."/></dcterms:subject>
    </xsl:template>	 
               
 	<xsl:template match="user">
  		<art:thumbnail rdf:resource="{avatar-url}" />
  		<dcterms:contributor><xsl:value-of select="username"/></dcterms:contributor>
	</xsl:template>	        		  
                
</xsl:stylesheet>                