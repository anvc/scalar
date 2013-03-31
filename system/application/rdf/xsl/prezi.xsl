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
		<xsl:text>Prezi</xsl:text>
	</xsl:variable>    
  
  	<!-- Templates -->    
                            
	<xsl:template match="/">
		<rdf:RDF>
			<xsl:apply-templates select="//node/node" />
		</rdf:RDF>		
	</xsl:template>  

	<xsl:template match="*"></xsl:template>
	
	<xsl:template match="//node/node">			
		<rdf:Description rdf:about="{landing_url}">
			<dcterms:source><xsl:value-of select="$archiveName" /></dcterms:source>
			<art:filename rdf:resource="http://prezi.com/embed/{id}/" />
			<art:thumbnail rdf:resource="{thumb_url}" />
			<art:sourceLocation rdf:resource="{landing_url}" />
			<dcterms:title><xsl:value-of select="title" /></dcterms:title>
			<dcterms:description><xsl:value-of select="description" /></dcterms:description>
			<dcterms:contributor><xsl:value-of select="owner/public_display_name" /></dcterms:contributor>
			<dcterms:date><xsl:value-of select="normalize-space(modified_at)"/></dcterms:date>
			<dcterms:identifier><xsl:value-of select="id"/></dcterms:identifier>			
		</rdf:Description>		
	</xsl:template>		 
                
</xsl:stylesheet>                