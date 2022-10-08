<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Traits;

use Drjele\Symfony\JsonForm\Element\AbstractElement;
use Drjele\Symfony\JsonForm\Exception\Exception;
use Symfony\Contracts\Translation\TranslatorInterface;

trait ElementCollectionTrait
{
    /** @var AbstractElement[] */
    private array $elements = [];

    public function addElement(AbstractElement $element): self
    {
        if (isset($this->elements[$element->getName()])) {
            throw new Exception(\sprintf('duplicate element name `%s`', $element->getName()));
        }

        $this->elements[$element->getName()] = $element;

        return $this;
    }

    private function renderElements(array $value, ?TranslatorInterface $translator): array
    {
        $elements = [];

        foreach ($this->elements as $element) {
            $elements[] = $element->render($value[$element->getName()] ?? null, $translator);
        }

        return $elements;
    }
}
